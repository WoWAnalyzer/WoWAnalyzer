import React from 'react';
import { VictoryChart, VictoryArea, VictoryLine, VictoryScatter, VictoryAxis, VictoryTheme, createContainer, VictoryTooltip, VictoryLegend, Border } from 'victory';

import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'parser/core/Analyzer';
import Tab from 'interface/others/Tab';

import StaggerFabricator from '../core/StaggerFabricator';
import './StaggerPoolGraph.css';

function rightEdgeFilter(events, resolution=1000, field='timestamp') {
  const initial = events[0][field];
  const bucket = event => Math.floor((event[field] - initial)/resolution);

  const reduced = events.reduce(({data, last}, event) => {
    if(bucket(last) < bucket(event)) {
      data.push(last);
      return { data, last: event };
    }
    if(bucket(last) === bucket(event)) {
      return { data, last: event };
    }
    throw Error('this should be unreachable');
  }, {
    data: [],
    last: events[0],
  });

  reduced.data.push(reduced.last);
  return reduced.data;
}

const COLORS = {
  death: 'red',
  purify: '#00ff96',
  stagger: 'rgba(240, 234, 214)',
  hp: 'rgb(255, 139, 45)',
  maxHp: 'rgb(183, 76, 75)',
};

/**
 * A graph of staggered damage (and related quantities) over time.
 *
 * The idea of this is to help people identify the root cause of:
 *   - overly high dtps (purifying well after a peak instead of at the peak)
 *   - death (stagger ticking too high? one-shot? health trickling away without heals?)
 *
 * As well as just giving a generally interesting look into when damage
 * actually hit your health bar on a fight.
 */
class StaggerPoolGraph extends Analyzer {
  static dependencies = {
    fab: StaggerFabricator,
  };

  _hpEvents = [];
  _staggerEvents = [];
  _deathEvents = [];
  _purifyEvents = [];

  on_addstagger(event) {
    this._staggerEvents.push(event);
  }

  on_removestagger(event) {
    if (event.trigger.ability && event.trigger.ability.guid === SPELLS.PURIFYING_BREW.id) {
      // record the *previous* timestamp for purification. this will
      // make the purifies line up with peaks in the plot, instead of
      // showing up *after* peaks
      event._lastStaggerChange = this._staggerEvents[this._staggerEvents.length-1].timestamp;
      this._purifyEvents.push(event);
    }

    this._staggerEvents.push(event);
  }

  on_toPlayer_death(event) {
    this._deathEvents.push(event);
  }

  on_toPlayer_damage(event) {
    this._hpEvents.push(event);
  }

  on_toPlayer_heal(event) {
    this._hpEvents.push(event);
  }

  formatPlotDuration(x) {
    const label = formatDuration(Math.floor((x - this.owner.fight.start_time)/1000), 1);
    return label.substring(0, label.length - 2);
  }

  get staggerData() {
    return this._staggerEvents;
  }

  get hpData() {
    return rightEdgeFilter(this._hpEvents.filter(ev => !!ev.hitPoints));
  }

  get maxHpData() {
    return rightEdgeFilter(this._hpEvents.filter(ev => !!ev.maxHitPoints));
  }

  plot() {
    const LABELS = {
      'max-hp-line': (event) => `Max HP: ${formatNumber(event.maxHitPoints)}`,
      'hp-area': (event) => `HP: ${formatNumber(event.hitPoints)}`,
      'stagger-area': (event) => `Staggered Damage: ${formatNumber(event.newPooledDamage)}`,
      'purify-scatter': (event) => `Purified ${formatNumber(event.amount)} damage`,
      'death': () => "Player Died",
    };
    const StaggerContainer = createContainer("voronoi", "zoom");
    const tooltip = (
      <VictoryTooltip 
        style={{
          fill: '#fff',
        }}
        flyoutStyle={{
          fill: 'rgba(10,10,10,0.9)',
          stroke: 'rgba(25,25,25,0.9)',
        }}
      />
    );
    const container = (
      <StaggerContainer 
        responsive
        zoomDimension="x" 
        minimumZoom={{ x: 60000, y: 1 }}
        labels={(point, index, points) => {
          return LABELS[point.childName](point);
        }}
        labelComponent={tooltip}
      />
    );

    return (
      <div className="graph-container" style={{backgroundColor: 'rgba(10,10,10,0.9)'}}>
        <VictoryChart theme={VictoryTheme.material}
          style={{
            labels: {
              fontSize: 10,
            },
            parent: { 
              backgroundColor: 'rgba(10,10,10,0.9)',
            },
          }}
          width={1200}
          height={400}
          containerComponent={container}
        >
          <VictoryLine data={this.maxHpData}
            name="max-hp-line"
            x="timestamp"
            y="maxHitPoints"
            style={{
              data: {
                stroke: COLORS.maxHp,
              },
            }}
          />
          <VictoryArea data={this.hpData}
            name="hp-area"
            x="timestamp"
            y="hitPoints"
            style={{
              data: {
                fill: COLORS.hp,
                fillOpacity: 0.2,
                stroke: COLORS.hp,
              },
            }}
          />
          <VictoryArea data={this.staggerData}
            name="stagger-area"
            x="timestamp" 
            y="newPooledDamage" 
            style={{
              data: {
                fill: COLORS.stagger,
                fillOpacity: 0.2,
                stroke: COLORS.stagger,
                strokeWidth: 2,
              },
            }}
          />
          <VictoryScatter data={this._purifyEvents}
            name="purify-scatter"
            x="_lastStaggerChange"
            y={({amount, newPooledDamage}) => amount + newPooledDamage}
            style={{
              data: {
                fill: COLORS.purify,
              },
            }}
          />
          {this._deathEvents.map((event, index) => (
            <VictoryLine 
              key={`death-${index}`}
              name="death"
              x={() => event.timestamp} 
              samples={1}
              style={{ data: { stroke: COLORS.death } }}
            />
            ))}
          <VictoryAxis 
            tickFormat={this.formatPlotDuration.bind(this)}
            tickCount={50}
            style={{ 
              tickLabels: { angle: -45 },
              grid: { stroke: 'none' },
            }}
          />
          <VictoryAxis dependentAxis 
            tickFormat={formatNumber}
            style={{
              grid: { stroke: 'none' },
            }}
          />
          <VictoryLegend 
            x={350}
            orientation="horizontal"
            colorScale={[COLORS.purify, COLORS.stagger, COLORS.hp, COLORS.maxHp]}
            data={[
              { name: 'Purifying Brew Cast' },
              { name: 'Stagger Pool', symbol: { type: 'minus' } }, 
              { name: 'Hit Points', symbol: { type: 'minus' } },
              { name: 'Max Hit Points', symbol: { type: 'minus' } },
            ]}
            borderComponent={<Border width={0} />}
          />
        </VictoryChart>
      </div>
    );
  }

  tab() {
    return {
      title: 'Stagger Pool',
      url: 'stagger-pool',
      render: () => (
        <Tab>
          {this.plot()}
          <div style={{ paddingLeft: '1em', paddingRight: '1em' }}>
            Damage you take is placed into a <em>pool</em> by <SpellLink id={SPELLS.STAGGER.id} />. This damage is then removed by the damage-over-time component of <SpellLink id={SPELLS.STAGGER.id} /> or by <SpellLink id={SPELLS.PURIFYING_BREW.id} /> (or other sources of purification). This plot shows the amount of damage pooled over the course of the fight.
          </div>
        </Tab>
      ),
    };
  }
}

export default StaggerPoolGraph;
