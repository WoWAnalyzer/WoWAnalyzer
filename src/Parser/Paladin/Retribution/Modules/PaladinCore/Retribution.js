import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import GetDamageBonus from 'Parser/Paladin/Shared/Modules/GetDamageBonus';

const RETRIBUTION_DAMAGE_BONUS = 0.2;

class Retribution extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_byPlayer_damage(event) {
    if (!this.combatants.selected.hasBuff(SPELLS.RETRIBUTION_BUFF.id)) {
      return;
    }
    this.bonusDmg += GetDamageBonus(event, RETRIBUTION_DAMAGE_BONUS);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RETRIBUTION_BUFF.id} />}
        value={`${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label="Damage contributed"
        tooltip={`Retribution contributed ${formatNumber(this.bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} %).`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default Retribution;
