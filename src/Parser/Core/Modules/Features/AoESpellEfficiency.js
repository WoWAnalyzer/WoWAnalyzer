import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import calculateMaxCasts from 'Parser/Core/calculateMaxCasts';
import Abilities from 'Parser/Core/Modules/Abilities';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';

/*
  Creates a suggestion for an AoE-Spell based on the amount of hits done and min. amount of hits possible
*/

class AoESpellEfficiency extends Analyzer {
  static dependencies = {
    abilities: Abilities,
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
    const cooldown = this.abilities.getAbility(this.ability.id).cooldown;
    return Math.ceil(calculateMaxCasts(cooldown, this.owner.fightDuration));
  }

  get possibleHits() {
    const cooldown = this.abilities.getAbility(this.ability.id).cooldown;
    let lastCast = this.owner.fight.start_time;
    let missedCasts = 0;

    this.casts.forEach((element, index) => {
      if (element.timestamp - lastCast >= cooldown * 1000 && element.hits === 1) {
        missedCasts += 1;
      }
      lastCast = element.timestamp;
    });

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
          return suggest(<React.Fragment>It's benefitial to delay <SpellLink id={this.ability.id} /> to hit multiple targets, but don't delay it too long or you'll miss out on casts and possible hits.</React.Fragment>)
            .icon(this.ability.icon)
            .actual(`${this.totalHits} total hits`)
            .recommended(`${this.possibleHits} or more hits were possible`);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={this.ability.id} />}
        value={`${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label="Damage contributed"
        tooltip={`
          ${this.ability.name} added a total of ${formatNumber(this.bonusDmg)} damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%). </br>
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default AoESpellEfficiency;
