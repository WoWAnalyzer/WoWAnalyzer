import React from 'react';
import PropTypes from 'prop-types';
import {
  FlexibleWidthXYPlot as XYPlot,
  XAxis,
  YAxis,
  LineSeries,
  AreaSeries,
  MarkSeries,
  DiscreteColorLegend,
  Hint,
} from 'react-vis';
import VerticalLine from 'interface/others/charts/VerticalLine';
import Analyzer from 'parser/core/Analyzer';
import Panel from 'interface/others/Panel';
import { formatNumber, formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import './SelfHealTimingGraph.scss';

const DEATH_BUFFER = 200;

/**
 * Goal is to remove pressure from healers by selfhealing more when really needed (eg. at low health) / improving tanks reactive selfhealing timings
*/
class SelfHealTimingGraph extends Analyzer {
  _hpEvents = [];
  _deathEvents = [];
  _selfhealTimestamps = [];


  selfHealSpell = SPELLS.HEALTHSTONE;
  tabTitle = "Selheal Timing";
  tabURL = 'selfheal-timings';

  on_toPlayer_death(event) {
    this._deathEvents.push(event);
  }

  on_toPlayer_damage(event) {
    this._hpEvents.push(event);
  }

  on_toPlayer_heal(event) {
    this._hpEvents.push(event);

    if (event.ability.guid === this.selfHealSpell.id && event.sourceID === event.targetID) {
      this._selfhealTimestamps.push(event);
    }
  }

  get plot() {
    const _deaths = this._deathEvents.map(({ timestamp, ability }) => {
      // find last HP event (within 200ms of death event, usually should be the same timestamp)
      const lastHpIndex = this._hpEvents.findIndex(e => e.timestamp >= timestamp - DEATH_BUFFER);
      // this event is usually with hitPoints already 0, so we need one event before that
      // return if event doesn't exist or is actually the first event (on-pull death?)
      if (lastHpIndex === -1 || lastHpIndex === 0) {
        this.log('Didn\'t find last HP event before death');
        return undefined;
      }
      const { hitPoints, maxHitPoints } = this._hpEvents[lastHpIndex - 1];
      const p = (hitPoints / maxHitPoints) || 0;
      const percentage = Math.min(Math.round(p * 100), 100);
      return {
        timestamp,
        percentage,
        ability,
      };
    });

    const _hp = this._hpEvents.filter(event => event.hitPoints !== undefined && event.maxHitPoints !== undefined)
      .map(({ timestamp, hitPoints, maxHitPoints }) => {
        const p = (hitPoints / maxHitPoints) || 0;
        return {
          x: timestamp,
          y: Math.min(Math.round(p * 100), 100),
        };
      });

    const _casts = this._selfhealTimestamps.map(event => {
      const startingHP = event.hitPoints - (event.amount || 0) + (event.absorbed || 0) + (event.absorb || 0);
      const p = (startingHP / event.maxHitPoints) || 0;
      const percentage = Math.min(Math.round(p * 100), 100);
      return {
        x: event.timestamp,
        y: percentage,
        ability: event.ability,
        amount: event.amount || 0,
        overheal: event.overheal || 0,
        hitPoints: startingHP,
      };
    });

    return (
      <div className="graph-container">
        <SelfHealChart
          selfHealSpell={this.selfHealSpell}
          casts={_casts}
          hp={_hp}
          deaths={_deaths}
          startTime={this.owner.fight.start_time}
        />
      </div>
    );
  }

  tab() {
    return {
      title: this.tabTitle,
      url: this.tabURL,
      render: () => (
        <Panel
          explanation={(
            <>
              This plot shows you your <SpellLink id={this.selfHealSpell.id} /> casts relative to your Health Points to help you improve your <SpellLink id={this.selfHealSpell.id} /> timings.<br />
              Improving those timings by selfhealing at low health and the correct time will remove a lot of pressure from your healers.
            </>
          )}
        >
          {this.plot}
        </Panel>
      ),
    };
  }
}

class SelfHealChart extends React.Component {
  static propTypes = {
    selfHealSpell: PropTypes.object.isRequired,
    startTime: PropTypes.number.isRequired,
    hp: PropTypes.array.isRequired,
    casts: PropTypes.array.isRequired,
    deaths: PropTypes.array.isRequired,
  };

  state = {
    hoveredCast: null,
    hoveredHp: null,
  };

  colors = {
    DEATH: '#ff2222',
    HEALTH: 'rgb(255, 139, 45)',
    HEALTH_FILL: 'rgba(255, 139, 45, 0.2)',
    SELF_HEAL: '#ffffff',
  };

  render() {
    const { selfHealSpell, startTime, hp, casts, deaths } = this.props;
    return (
      <XYPlot
        height={300}
        yDomain={[0, 100]}
        style={{
          fill: '#fff',
          stroke: '#fff',
        }}
        margin={{
          top: 30,
        }}
        onMouseLeave={() => this.setState({ hoveredHp: null })}
      >
        <DiscreteColorLegend
          orientation="horizontal"
          strokeWidth={2}
          items={[
            { title: 'Player Death', color: this.colors.DEATH },
            { title: 'Health', color: this.colors.HEALTH },
            { title: `${selfHealSpell.name} Cast`, color: this.colors.SELF_HEAL },
          ]}
        />
        <XAxis title="Time" tickFormat={value => formatDuration((value - startTime) / 1000)} />
        <YAxis title="Health %" position="middle" tickFormat={value => formatNumber(value)} />
        <AreaSeries
          data={hp}
          color={this.colors.HEALTH_FILL}
          stroke="transparent"
        />
        <LineSeries
          data={hp}
          color={this.colors.HEALTH}
          onNearestXY={d => this.setState({ hoveredHp: d })}
        />
        <MarkSeries
          data={casts}
          color={this.colors.SELF_HEAL}
          size={3}
          onValueMouseOver={d => this.setState({ hoveredCast: d })}
          onValueMouseOut={() => this.setState({ hoveredCast: null })}
        />
        {deaths.map(death => (
          <VerticalLine
            value={death.timestamp}
            style={{
              line: { background: this.colors.DEATH },
            }}
          >
            <strong>{formatDuration((death.timestamp - startTime) / 1000)}</strong><br />
            Player died when hit by {(death.ability && death.ability.name) || 'an unknown ability'} at {formatNumber(death.percentage)}% HP.
          </VerticalLine>
        ))}
        {this.state.hoveredCast && (
          <Hint
            align={{
              horizontal: 'right',
              vertical: 'bottom',
            }}
            value={this.state.hoveredCast}
          >
            <div className="react-tooltip-lite selfheal-value-tooltip">
              <strong>{formatDuration((this.state.hoveredCast.x - startTime) / 1000)}</strong><br />
              {selfHealSpell.name} for {formatNumber(this.state.hoveredCast.amount)}
              {this.state.hoveredCast.overheal > 0 && ` (${formatNumber(this.state.hoveredCast.overheal)} overhealing)`}
              &nbsp;at {formatNumber(this.state.hoveredCast.hitPoints)} HP ({this.state.hoveredCast.y}%)
            </div>
          </Hint>
        )}
        {this.state.hoveredHp && !this.state.hoveredCast && (
          <Hint
            align={{
              horizontal: 'right',
              vertical: 'bottom',
            }}
            value={this.state.hoveredHp}
          >
            <div className="react-tooltip-lite selfheal-value-tooltip">
              <strong>{formatDuration((this.state.hoveredHp.x - startTime) / 1000)}</strong><br />
              Health: {this.state.hoveredHp.y} %
            </div>
          </Hint>
        )}
      </XYPlot>
    );
  }
}

export default SelfHealTimingGraph;
