import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import calculateMaxCasts from 'parser/core/calculateMaxCasts';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';

/*
  Creates a suggestion for an AoE-Spell based on the amount of hits done and min. amount of hits possible
*/

class AoESpellEfficiency extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  bonusDmg = 0;
  casts = [];

  on_byPlayer_cast(event) {
    if (event.ability.guid !== this.ability.id) {
      return;
    }

    this.casts.push({
      timestamp: event.timestamp,
      hits: 0,
    });
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== this.ability.id) {
      return;
    }

    this.bonusDmg += event.amount + (event.absorbed || 0);
    this.casts[this.casts.length - 1].hits += 1;
  }

  get maxCasts() {
    const cooldown = this.abilityTracker.getAbility(this.ability.id).cooldown;
    return Math.ceil(calculateMaxCasts(cooldown, this.owner.fightDuration));
  }

  get possibleHits() {
    const cooldownMS = this.abilityTracker.getAbility(this.ability.id).cooldown * 1000;
    let lastCast = null;
    let missedCasts = 0;
    let timeSum = 0;

    this.casts.forEach(e => {
      if (!lastCast) {
        timeSum = e.timestamp - this.owner.fight.start_time;
      } else {
        timeSum += e.timestamp - lastCast - cooldownMS;
      }
      lastCast = e.timestamp;
      missedCasts += Math.floor(timeSum / cooldownMS);
      timeSum %= cooldownMS;
      // reset the time sum if a cast hit more than one target (we have to assume this cast was at an optimal time)
      if (e.hits > 1) {
        timeSum = 0;
      }
    });

    timeSum += this.owner.currentTimestamp - lastCast;
    missedCasts += Math.floor(timeSum / cooldownMS);
    timeSum %= cooldownMS;

    return Math.max(this.totalHits + missedCasts, this.maxCasts);
  }

  get totalHits() {
    return this.casts.reduce((a, b) => a + b.hits, 0);
  }

  get hitSuggestionThreshold() {
    return {
      actual: this.totalHits / this.possibleHits,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: .8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.hitSuggestionThreshold)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<>It's benefitial to delay <SpellLink id={this.ability.id} /> to hit multiple targets, but don't delay it too long or you'll miss out on casts and possible hits.</>)
            .icon(this.ability.icon)
            .actual(`${this.totalHits} total hits`)
            .recommended(`${this.possibleHits} or more hits were possible`);
        });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(5)}
        icon={<SpellIcon id={this.ability.id} />}
        value={`${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label="Damage contributed"
        tooltip={`
          ${this.ability.name} added a total of ${formatNumber(this.bonusDmg)} damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%). </br>
        `}
      />
    );
  }
}

export default AoESpellEfficiency;
