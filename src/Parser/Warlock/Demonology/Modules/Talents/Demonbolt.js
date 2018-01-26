import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import DemoPets from '../WarlockCore/Pets';

const DEMONBOLT_DAMAGE_BONUS_PER_PET = 0.1;

class Demonbolt extends Analyzer {
  static dependencies = {
    demoPets: DemoPets,
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.DEMONBOLT_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.DEMONBOLT_TALENT.id) {
      return;
    }
    // Demonbolt has additive bonus for each pet
    const bonusMultiplier = DEMONBOLT_DAMAGE_BONUS_PER_PET * this.demoPets.getPets(event.timestamp).length;
    this.bonusDmg += calculateEffectiveDamage(event, bonusMultiplier);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DEMONBOLT_TALENT.id} />}
        value={`${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label="Demonbolt bonus damage"
        tooltip={`Your Demonbolt did ${formatNumber(this.bonusDmg)} damage over regular Shadow Bolt (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} %).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(5);
}

export default Demonbolt;
