import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatMilliseconds, formatNumber, formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = true;

// Log where someone died: https://wowanalyzer.com/report/RjH6AnYdP8GWzX4h/2-Heroic+Aggramar+-+Kill+(6:23)/Kantasai
class DeathTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  lastDeathTimestamp = 0;
  lastResurrectionTimestamp = 0;
  timeDead = 0;
  castCount = 0;
  isAlive = true;

  on_toPlayer_death(event) {
    this.lastDeathTimestamp = this.owner.currentTimestamp;
    debug && console.log("Player Died @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    this.isAlive = false;
  }

  on_toPlayer_resurrect(event) {
    this.lastResurrectionTimestamp = this.owner.currentTimestamp;
    this.timeDead += this.lastResurrectionTimestamp - this.lastDeathTimestamp;
    debug && console.log("Player was Resurrected @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    this.isAlive = true;
  }

  on_byPlayer_cast(event) {
    this.castCount += 1;

    if (event.ability.guid === SPELLS.REINCARNATION.id) {
      this.lastResurrectionTimestamp = this.owner.currentTimestamp;
      this.timeDead += this.lastResurrectionTimestamp - this.lastDeathTimestamp;
      debug && console.log("Player was Resurrected @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
      this.isAlive = true;
    }
  }

  get totalTimeDead() {
    return this.timeDead + (this.isAlive ? 0 : this.owner.currentTimestamp - this.lastDeathTimestamp);
  }

  get timeDeadSeconds() {
    return (this.totalTimeDead / 1000);
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
    if (!boss || !boss.fight.disableDeathSuggestion) {
      when(this.totalTimeDead).isGreaterThan(0)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You died during this fight and you were dead for {formatNumber(this.timeDeadSeconds)} seconds ({formatPercentage(this.timeDeadPercent)}% of the fight). Make sure you are paying attention to mechanics and dodging avoidable damage. Additionally, make sure you are using your defensive abilities to avoid damage and Health Potions, Healthstones, or self healing abilities to heal yourself when you are very low.</span>)
            .icon('ability_fiegndead')
            .actual(`${formatNumber(this.timeDeadSeconds)} seconds dead`)
            .recommended(`${formatNumber(recommended)} is recommended`)
            .major(this.deathSuggestionThresholds.isGreaterThan.major);
        });
    }
    when(this.castCount).isLessThan(1)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You did not cast a single spell this fight. You were either dead for the entire fight, or were AFK.</span>)
          .icon('ability_fiegndead')
          .major(this.deathSuggestionThresholds.isGreaterThan.major);
      });
  }
}

export default DeathTracker;
