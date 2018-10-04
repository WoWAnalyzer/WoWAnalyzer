import React from 'react';

import { formatMilliseconds, formatNumber, formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';

const WIPE_MAX_DEAD_TIME = 15 * 1000; // 15sec

const debug = false;

// Log where someone died: https://wowanalyzer.com/report/RjH6AnYdP8GWzX4h/2-Heroic+Aggramar+-+Kill+(6:23)/Kantasai
class DeathTracker extends Analyzer {
  deaths = [];
  resurrections = [];

  lastDeathTimestamp = 0;
  lastResurrectionTimestamp = 0;
  _timeDead = 0;
  _didCast = false;
  isAlive = true;

  die(event) {
    this.lastDeathTimestamp = this.owner.currentTimestamp;
    debug && console.log("Player Died @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    this.isAlive = false;
    this.deaths.push(event);
  }
  resurrect(event) {
    this.lastResurrectionTimestamp = this.owner.currentTimestamp;
    this._timeDead += this.lastResurrectionTimestamp - this.lastDeathTimestamp;
    debug && console.log("Player was Resurrected @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    this.isAlive = true;
    this.resurrections.push(event);
  }

  on_toPlayer_death(event) {
    this.die(event);
  }
  on_toPlayer_resurrect(event) {
    this.resurrect(event);
  }
  on_byPlayer_cast(event) {
    this._didCast = true;

    if (!this.isAlive) {
      this.resurrect(event);
    }
  }
  on_byPlayer_begincast(event) {
    if (!this.isAlive) {
      this.resurrect(event);
    }
  }
  on_toPlayer_heal(event) {
    if (!this.isAlive) {
      this.resurrect(event);
    }
  }
  on_toPlayer_damage(event) {
    if (!this.isAlive) {
      this.resurrect(event);
    }
  }

  get totalTimeDead() {
    return this._timeDead + (this.isAlive ? 0 : this.owner.currentTimestamp - this.lastDeathTimestamp);
  }
  get timeDeadPercent() {
    return this.totalTimeDead / this.owner.fightDuration;
  }

  get deathSuggestionThresholds() {
    return {
      actual: this.timeDeadPercent,
      isGreaterThan: {
        major: 0.00,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const boss = this.owner.boss;
    const fight = this.owner.fight;
    const disableDeathSuggestion = boss && boss.fight.disableDeathSuggestion;
    const isWipe = !fight.kill;
    const isWipeDeath = isWipe && this.totalTimeDead < WIPE_MAX_DEAD_TIME;

    if (!disableDeathSuggestion && !isWipeDeath) {
      when(this.timeDeadPercent).isGreaterThan(0)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(
            <>
              You died during this fight and were dead for {formatPercentage(actual)}% of the fight duration ({formatNumber(this.totalTimeDead / 1000)} seconds). Dying has a significant performance cost. View the death recap below to see the damage taken and what defensives and potions were still available.
            </>
          )
            .icon('ability_fiegndead')
            .actual(`You were dead for ${formatPercentage(actual)}% of the fight`)
            .recommended('0% is recommended')
            .major(this.deathSuggestionThresholds.isGreaterThan.major);
        });
    }
    when(this._didCast).isFalse()
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You did not cast a single spell this fight. You were either dead for the entire fight, or were AFK.')
          .icon('ability_fiegndead')
          .major(this.deathSuggestionThresholds.isGreaterThan.major);
      });
  }
}

export default DeathTracker;
