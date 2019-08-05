import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'parser/core/Analyzer';
import Panel from 'interface/others/Panel';

import StaggerFabricator from '../core/StaggerFabricator';
import StaggerGraph from './StaggerGraph';

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
  _lastHp = 0;
  _lastMaxHp = 0;

  on_addstagger(event) {
    this._staggerEvents.push({...event, hitPoints: this._lastHp, maxHitPoints: this._lastMaxHp });
  }

  on_removestagger(event) {
    if (event.trigger.ability && event.trigger.ability.guid === SPELLS.PURIFYING_BREW.id) {
      // record the *previous* timestamp for purification. this will
      // make the purifies line up with peaks in the plot, instead of
      // showing up *after* peaks
      this._purifyEvents.push({...event, previousTimestamp: this._staggerEvents[this._staggerEvents.length - 1].timestamp});
    }

    this._staggerEvents.push({...event, hitPoints: this._lastHp, maxHitPoints: this._lastMaxHp });
  }

  on_toPlayer_death(event) {
    this._deathEvents.push(event);
  }

  on_toPlayer_damage(event) {
    this._hpEvents.push(event);
    this._lastHp = event.hitPoints ? event.hitPoints : this._lastHp;
    this._lastMaxHp = event.maxHitPoints ? event.maxHitPoints : this._lastMaxHp;
  }

  on_toPlayer_heal(event) {
    this._hpEvents.push(event);
    this._lastHp = event.hitPoints ? event.hitPoints : this._lastHp;
    this._lastMaxHp = event.maxHitPoints ? event.maxHitPoints : this._lastMaxHp;
  }

  get plot() {
    const stagger = this._staggerEvents.map(({timestamp, newPooledDamage, hitPoints, maxHitPoints}) => {
      return {
        x: timestamp,
        y: newPooledDamage,
        hp: hitPoints,
        maxHp: maxHitPoints,
      };
    });

    const purifies = this._purifyEvents.map(({previousTimestamp, newPooledDamage, amount}) => ({ x: previousTimestamp, y: newPooledDamage + amount, amount }));

    const hp = this._hpEvents.filter(({hitPoints}) => hitPoints !== undefined)
      .map(({timestamp, hitPoints}) => {
        return {
          x: timestamp,
          y: hitPoints,
        };
      });

    const maxHp = this._hpEvents.filter(({maxHitPoints}) => maxHitPoints !== undefined)
      .map(({timestamp, maxHitPoints}) => {
        return {
          x: timestamp,
          y: maxHitPoints,
        };
      });

    const deaths = this._deathEvents.map(({timestamp}) => ({x: timestamp}));
    return (
      <div className="graph-container">
        <StaggerGraph
          startTime={this.owner.fight.start_time}
          offsetTime={this.owner.fight.offset_time}
          stagger={stagger}
          hp={hp}
          maxHp={maxHp}
          purifies={purifies}
          deaths={deaths} />
      </div>
    );
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
