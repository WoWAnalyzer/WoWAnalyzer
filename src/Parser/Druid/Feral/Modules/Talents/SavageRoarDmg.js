import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import getDamageBonus from '../FeralCore/getDamageBonus';

const SAVAGE_ROAR_DAMAGE_BONUS = 0.15;

class SavageRoar extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SAVAGE_ROAR_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.targetIsFriendly) {
      return;
    }
    if (this.selectedCombatant.hasBuff(SPELLS.SAVAGE_ROAR_TALENT.id, event.timestamp)) {
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
