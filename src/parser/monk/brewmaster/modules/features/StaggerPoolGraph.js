import React from 'react';
import { XYPlot, XAxis, YAxis, LineSeries, AreaSeries, Hint } from 'react-vis';

import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'parser/core/Analyzer';
import Tab from 'interface/others/Tab';

import StaggerFabricator from '../core/StaggerFabricator';

const COLORS = {
  death: 'red',
  purify: '#00ff96',
  stagger: 'rgba(240, 234, 214)',
  hp: 'rgb(255, 139, 45)',
  maxHp: 'rgb(183, 76, 75)',
};

class StaggerGraph extends React.Component {
  state = {
    hover: null,
  };

  render() {
    const {stagger, hp, maxHp} = this.props;
    return (
      <XYPlot width={1200} height={400} style={{ height: '400px', paddingLeft: '1.5em' }}>
        <XAxis title="Time" tickFormat={value => formatDuration(value) } />
        <YAxis title="Stagger Pool" tickFormat={value => formatNumber(value)} />
        <AreaSeries
          data={hp}
          color={COLORS.hp}
          style={{strokeWidth: 2, fillOpacity: 0.2}}
        />
        <AreaSeries 
          data={stagger} 
          curve="curveLinear"
          color={COLORS.stagger} 
          style={{strokeWidth: 2, fillOpacity: 0.2}}
          onNearestXY={d => this.setState({hover: d})}
          onSeriesMouseOut={d => this.setState({hover: null})}
        />
        <LineSeries
          data={maxHp}
          color={COLORS.maxHp}
          curve={'curveLinear'}
          strokeWidth={2}
          style={{fillOpacity: 0}}
        />
        {this.state.hover && <Hint 
          value={this.state.hover} 
          format={value => [
            { title: 'Staggered Damage', value: formatNumber(value.y) },
            { title: 'Health', value: `${formatNumber(value.hp)} / ${formatNumber(value.maxHp)}` },
          ]}
          style={{
            backgroundColor: '#111',
            padding: '.5em',
            borderRadius: '5px',
          }}
          align={{
            horizontal: 'right',
            vertical: 'top',
          }}
        />}
      </XYPlot>
    );
  }
}

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
  _purifyTimestamps = [];

  on_addstagger(event) {
    this._staggerEvents.push(event);
  }

  on_removestagger(event) {
    if (event.trigger.ability && event.trigger.ability.guid === SPELLS.PURIFYING_BREW.id) {
      // record the *previous* timestamp for purification. this will
      // make the purifies line up with peaks in the plot, instead of
      // showing up *after* peaks
      this._purifyTimestamps.push(this._staggerEvents[this._staggerEvents.length-1].timestamp);
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

  plot() {
    const stagger = this._staggerEvents.map(({timestamp, newPooledDamage, trigger}) => { 
      return { 
        x: (timestamp - this.owner.fight.start_time) / 1000, 
        y: newPooledDamage,
        hp: trigger.hitPoints,
        maxHp: trigger.maxHitPoints,
      }; 
    });

    const hp = this._hpEvents.filter(({hitPoints}) => hitPoints !== undefined)
      .map(({timestamp, hitPoints}) => {
        return {
          x: (timestamp - this.owner.fight.start_time) / 1000,
          y: hitPoints,
        };
      });

    const maxHp = this._hpEvents.filter(({maxHitPoints}) => maxHitPoints !== undefined)
      .map(({timestamp, maxHitPoints}) => {
        return {
          x: (timestamp - this.owner.fight.start_time) / 1000,
          y: maxHitPoints,
        };
      });
    return (
      <div className="graph-container">
        <StaggerGraph stagger={stagger} hp={hp} maxHp={maxHp} />
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
          <div style={{ paddingLeft: '1em' }}>
            Damage you take is placed into a <em>pool</em> by <SpellLink id={SPELLS.STAGGER.id} />. This damage is then removed by the damage-over-time component of <SpellLink id={SPELLS.STAGGER.id} /> or by <SpellLink id={SPELLS.PURIFYING_BREW.id} /> (or other sources of purification). This plot shows the amount of damage pooled over the course of the fight.
          </div>
        </Tab>
      ),
    };
  }
}

export default StaggerPoolGraph;
