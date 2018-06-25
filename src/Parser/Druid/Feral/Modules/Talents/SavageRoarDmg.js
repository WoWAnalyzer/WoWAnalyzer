import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import getDamageBonus from '../FeralCore/getDamageBonus';
import { SAVAGE_ROAR_DAMAGE_BONUS } from '../../Constants';



class SavageRoar extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SAVAGE_ROAR_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.targetIsFriendly) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.SAVAGE_ROAR_TALENT.id, event.timestamp)) {
      this.bonusDmg += getDamageBonus(event, SAVAGE_ROAR_DAMAGE_BONUS);
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SAVAGE_ROAR_TALENT.id} />}
        value={`${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label="Damage contributed"
        tooltip={`Your Savage Roar talent contributed ${formatNumber(this.bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} %).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(1);
}

export default SavageRoar;
