import React from 'react';
import { AutoSizer } from 'react-virtualized';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Panel from 'interface/others/Panel';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import BaseChart, { formatTime } from 'interface/others/BaseChart';
import Events from 'parser/core/Events';

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

  constructor(options){
    super(options);
    this.addEventListener(Events.death.to(SELECTED_PLAYER), this.onDeath);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.onHealTaken);
  }

  onDeath(event) {
    this._deathEvents.push(event);
  }

  onDamageTaken(event) {
    this._hpEvents.push(event);
  }

  onHealTaken(event) {
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
        x: timestamp - this.owner.fight.start_time,
        percentage,
        ability,
      };
    });

    const _hp = this._hpEvents.filter(event => event.hitPoints !== undefined && event.maxHitPoints !== undefined)
      .map(({ timestamp, hitPoints, maxHitPoints }) => {
        const p = (hitPoints / maxHitPoints) || 0;
        return {
          x: timestamp - this.owner.fight.start_time,
          y: Math.min(Math.round(p * 100), 100),
        };
      });

    const _casts = this._selfhealTimestamps.map(event => {
      const startingHP = event.hitPoints - (event.amount || 0) + (event.absorbed || 0) + (event.absorb || 0);
      const p = (startingHP / event.maxHitPoints) || 0;
      const percentage = Math.min(Math.round(p * 100), 100);
      return {
        x: event.timestamp - this.owner.fight.start_time,
        y: percentage,
        ability: event.ability,
        amount: event.amount || 0,
        overheal: event.overheal || 0,
        hitPoints: startingHP,
      };
    });

    const baseEncoding = {
      x: {
        field: 'x',
        type: 'quantitative',
        axis: {
          labelExpr: formatTime('datum.value'),
          grid: false,
        },
        title: null,
        scale: { zero: true },
      },
      y: {
        field: 'y',
        type: 'quantitative',
        title: null,
        axis: {
          grid: false,
        },
      },
    };

    const spec = {
      layer: [
        {
          data: {
            name: 'hp',
          },
          mark: {
            type: 'area',
            line: {
              interpolate: 'linear',
              color: '#fab700',
              strokeWidth: 1,
            },
            color: 'rgba(250, 183, 0, 0.15)',
          },
          encoding: baseEncoding,
        },
        {
          data: {
            name: 'casts',
          },
          mark: {
            type: 'point',
            size: 60,
            color: 'white',
            filled: true,
          },
          encoding: {
            ...baseEncoding,
            tooltip: [
              { field: 'ability.name', type: 'nominal', title: 'Ability' },
              { field: 'hitPoints', type: 'quantitative', title: 'Hit Points', format: '.3~s' },
              { field: 'amount', type: 'quantitative', title: 'Healing', format: '.3~s' },
              { field: 'overheal', type: 'quantitative', title: 'Overhealing', format: '.3~s' },
            ],
          },
        },
        {
          data: {
            name: 'deaths',
          },
          mark: {
            type: 'rule',
            color: 'red',
            strokeWidth: 2,
          },
          encoding: {
            x: baseEncoding.x,
            tooltip: [
              { field: 'ability.name', type: 'nominal', title: 'Killing Ability' },
              { field: 'percentage', type: 'quantitative', title: 'HP % When Hit' },
            ],
          },
        },
      ],
    };
    const data = {
      hp: [{x: 0, y: 100}].concat(_hp),
      casts: _casts,
      deaths: _deaths,
    };

    return (
      <div className="graph-container" style={{
        width: '100%',
        minHeight: 200,
      }}>
        <AutoSizer>
          {({ width, height }) => (
            <BaseChart width={width} height={height} spec={spec} data={data} />
          )}
        </AutoSizer>
      </div>
    );
  }

  tab() {
    return {
      title: this.tabTitle,
      url: this.tabURL,
      render: () => (
        <Panel
          title={this.tabTitle}
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

export default SelfHealTimingGraph;
