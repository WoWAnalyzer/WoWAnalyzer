import React from 'react';
import { AutoSizer } from 'react-virtualized';
import { VegaLite } from 'react-vega';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DeathEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import Panel from 'interface/others/Panel';
import { defaultConfig, formatTime } from 'interface/others/FooterChart';
import { AddStaggerEvent, RemoveStaggerEvent, StaggerEventType } from '../core/StaggerFabricator';

import StaggerFabricator from '../core/StaggerFabricator';

interface StaggerEvent {
  timestamp: number;
  newPooledDamage: number;
  hitPoints: number | null;
  maxHitPoints: number | null;
}

type PurifyEvent = RemoveStaggerEvent & {
  previousTimestamp: number;
}

interface HPEvent {
  timestamp: number;
  hitPoints?: number;
  maxHitPoints?: number;
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

  _hpEvents: HPEvent[] = [];
  _staggerEvents: StaggerEvent[] = [];
  _deathEvents: DeathEvent[] = [];
  _purifyEvents: PurifyEvent[] = [];
  _lastHp: number | null = null;
  _lastMaxHp: number | null = null;

  constructor(options: any) {
    super(options);

    this.addEventListener(Events.death.to(SELECTED_PLAYER), this._death);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this._damage);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this._heal);
    this.addEventListener(StaggerEventType.Add, this._addstagger);
    this.addEventListener(StaggerEventType.Remove, this._removestagger);
  }

  _addstagger(event: AddStaggerEvent) {
    this._staggerEvents.push({...event, hitPoints: this._lastHp, maxHitPoints: this._lastMaxHp });
  }

  _removestagger(event: RemoveStaggerEvent) {
    if (event.trigger!.ability && event.trigger!.ability.guid === SPELLS.PURIFYING_BREW.id) {
      // record the *previous* timestamp for purification. this will
      // make the purifies line up with peaks in the plot, instead of
      // showing up *after* peaks
      this._purifyEvents.push({...event, previousTimestamp: this._staggerEvents[this._staggerEvents.length - 1].timestamp});
    }

    this._staggerEvents.push({...event, hitPoints: this._lastHp, maxHitPoints: this._lastMaxHp });
  }

  _death(event: DeathEvent) {
    this._deathEvents.push(event);
  }

  _damage(event: DamageEvent) {
    this._hpEvents.push(event);
    this._lastHp = event.hitPoints ? event.hitPoints : this._lastHp;
    this._lastMaxHp = event.maxHitPoints ? event.maxHitPoints : this._lastMaxHp;
  }

  _heal(event: HealEvent) {
    this._hpEvents.push(event);
    this._lastHp = event.hitPoints ? event.hitPoints : this._lastHp;
    this._lastMaxHp = event.maxHitPoints ? event.maxHitPoints : this._lastMaxHp;
  }

  get plot() {
    const xAxis = {
      field: 'seconds',
      type: 'quantitative' as const,
      axis: {
        labelExpr: formatTime('datum.value * 500'),
        grid: false,
      },
      title: null,
      scale: { zero: true },
    };

    const spec = {
      data: {
        name: 'combined',
      },
      transform: [
        {
          filter: 'isValid(datum.hitPoints)',
        },
        {
          calculate: `floor((datum.timestamp - ${this.owner.fight.start_time}) / 500)`,
          as: 'seconds',
        },
        {
          aggregate: [
            { op: 'mean' as const, field: 'hitPoints', as: 'mean_hitPoints' },
            { op: 'mean' as const, field: 'newPooledDamage', as: 'mean_newPooledDamage' },
          ],
          groupby: ['seconds'],
        },
        {
          calculate: 'if(isValid(datum.mean_newPooledDamage), datum.mean_newPooledDamage, 0)',
          as: 'mean_newPooledDamage',
        },
      ],
      encoding: {
        x: xAxis,
        tooltip: [
          { field: 'mean_hitPoints', type: 'quantitative' as const, title: 'Hit Points', format: '.3~s' },
          { field: 'mean_newPooledDamage', type: 'quantitative' as const, title: 'Staggered Damage', format: '.3~s' },
        ],
      },
      layer: [
        {
          mark: {
            type: 'area' as const,
            line: {
              interpolate: 'linear' as const,
              color: '#fab700',
              strokeWidth: 1,
            },
            color: 'rgba(250, 183, 0, 0.15)',
          },
          encoding: {
            y: {
              field: 'mean_newPooledDamage',
              type: 'quantitative' as const,
              title: null,
              axis: {
                grid: false,
                format: '~s',
              },
            },
          },
        },
        {
          mark: {
            type: 'area' as const,
            line: {
              interpolate: 'linear' as const,
              color: 'rgb(255, 139, 45)',
              strokeWidth: 1,
            },
            color: 'rgba(255, 139, 45, 0.15)',
          },
          encoding: {
            y: {
              field: 'mean_hitPoints',
              type: 'quantitative' as const,
              title: null,
              axis: {
                grid: false,
                format: '~s',
              },
            },
          },
        },
        {
          mark: {
            type: 'rule' as const,
            color: 'grey',
          },
          selection: {
            hover: {
              type: 'single' as const,
              empty: 'none' as const,
              on: 'mouseover',
              nearest: true,
            },
          },
          encoding: {
            color: {
              condition: {
                selection: {
                  not: 'hover',
                },
                value: 'transparent',
              },
            },
          },
        },
        {
          data: {
            name: 'purifies',
          },
          mark: {
            type: 'point' as const,
            color: '#00ff96',
            filled: true,
            size: 60,
          },
          transform: [
            {
              calculate: `floor((datum.timestamp - ${this.owner.fight.start_time}) / 500) - 1`,
              as: 'seconds',
            },
            {
              aggregate: [
                { op: 'mean' as const, field: 'newPooledDamage', as: 'mean_newPooledDamage' },
                { op: 'mean' as const, field: 'amount', as: 'amount' },
              ],
              groupby: ['seconds'],
            },
            {
              calculate: 'datum.mean_newPooledDamage + datum.amount',
              as: 'oldPooledDamage',
            },
          ],
          encoding: {
            x: xAxis,
            y: {
              field: 'oldPooledDamage',
              type: 'quantitative' as const,
              title: null,
            },
            tooltip: [
              { field: 'amount', title: 'Amount Purified', format: '.3~s' },
              { field: 'oldPooledDamage', type: 'quantitative' as const, title: 'Staggered Damage', format: '.3~s' },
            ],
          },
        },
        {
          data: {
            name: 'deaths',
          },
          mark: {
            type: 'rule' as const,
            color: 'red',
          },
          transform: [
            {
              calculate: `floor((datum.timestamp - ${this.owner.fight.start_time}) / 500)`,
              as: 'seconds',
            },
          ],
          encoding: {
            x: xAxis,
          },
        },
      ],
    };

    if(this._staggerEvents.length > 0) {
      const combined = [
        {
          timestamp: this.owner.fight.start_time,
          newPooledDamage: 0,
          hitPoints: this._hpEvents[0].maxHitPoints,
        },
        ...this._staggerEvents,
        ...this._hpEvents,
      ];

      return (
        <div className="graph-container" style={{
          width: '100%',
          minHeight: 200,
        }}>
          <AutoSizer>
            {({ width, height }) => (
              <VegaLite
                spec={spec}
                data={{
                  combined,
                  purifies: this._purifyEvents,
                  deaths: this._deathEvents,
                }}
                config={defaultConfig}
                actions={false}
                theme="dark"
                tooltip={{theme: 'dark'}}
                width={width}
                height={height} />
            )}
          </AutoSizer>
        </div>
      );
    } else {
      return null;
    }
  }

  tab() {
    return {
      title: 'Stagger',
      url: 'stagger',
      render: () => (
        <Panel
          title="Stagger"
          explanation={(
            <>
              Damage you take is placed into a <em>pool</em> by <SpellLink id={SPELLS.STAGGER.id} />. This damage is then removed by the damage-over-time component of <SpellLink id={SPELLS.STAGGER.id} /> or by <SpellLink id={SPELLS.PURIFYING_BREW.id} /> (or other sources of purification). This plot shows the amount of damage pooled over the course of the fight.
            </>
          )}
        >
          {this.plot}
        </Panel>
      ),
    };
  }
}

export default StaggerPoolGraph;
