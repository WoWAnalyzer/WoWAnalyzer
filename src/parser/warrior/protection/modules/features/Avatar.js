import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { formatNumber, formatPercentage } from 'common/format';

const AVATAR_DAMAGE_INCREASE = 0.2;

class Avatar extends Analyzer {

  bonusDmg = 0;

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.AVATAR_TALENT.id) / this.owner.fightDuration;
  }

  on_byPlayer_damage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.AVATAR_TALENT.id)) {
      return;
    } 
    
    this.bonusDmg += calculateEffectiveDamage(event, AVATAR_DAMAGE_INCREASE);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.AVATAR_TALENT.id} />}
        value={`${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label="Damage contributed"
        tooltip={`
          Avatar contributed ${formatNumber(this.bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%). </br>
          Uptime was ${formatPercentage(this.uptime)}%
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default Avatar;
