import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import calculateMaxCasts from 'Parser/Core/calculateMaxCasts';
import Abilities from 'Parser/Core/Modules/Abilities';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatNumber, formatPercentage } from 'common/format';

class Consumption extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
    abilities: Abilities,
  };

  bonusDmg = 0;
  totalHits = 0;
  maxCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.CONSUMPTION_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.CONSUMPTION_TALENT.id) {
      return;
    }
    
    this.bonusDmg += event.amount + (event.absorbed || 0);
    this.totalHits += 1;
  }

  get hitSuggestionThreshold() {
    return {
      actual: this.totalHits / this.maxCasts,
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
          return suggest(<React.Fragment>It's benefitial to delay <SpellLink id={SPELLS.CONSUMPTION_TALENT.id} /> to hit multiple targets, but don't delay it too long or you'll miss out on casts and possible hits.</React.Fragment>)
            .icon(SPELLS.CONSUMPTION_TALENT.icon)
            .actual(`${this.totalHits} total hits`)
            .recommended(`${this.maxCasts} or more hits were possible`);
        });
  }

  statistic() {
    const consumptionCooldown = this.abilities.abilities.find(e => e.spell.id === SPELLS.CONSUMPTION_TALENT.id)._cooldown;
    this.maxCasts = Math.ceil(calculateMaxCasts(consumptionCooldown, this.owner.fightDuration));

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CONSUMPTION_TALENT.id} />}
        value={`${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label="Damage contributed"
        tooltip={`
          ${SPELLS.CONSUMPTION_TALENT.name} added a total of ${formatNumber(this.bonusDmg)} damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%). </br>
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default Consumption;
