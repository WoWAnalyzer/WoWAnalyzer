import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import DemoPets from '../WarlockCore/Pets';
import getDamageBonus from '../WarlockCore/getDamageBonus';

const DEMONBOLT_DAMAGE_BONUS_PER_PET = 0.1;

class Demonbolt extends Module {
  static dependencies = {
    demoPets: DemoPets,
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.DEMONBOLT_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.DEMONBOLT.id) {
      return;
    }
    // Demonbolt has additive bonus for each pet
    const bonusMultiplier = DEMONBOLT_DAMAGE_BONUS_PER_PET * this.demoPets.getPets(event.timestamp).length;
    this.bonusDmg += getDamageBonus(event, bonusMultiplier);
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
