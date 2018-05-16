import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import { formatNumber, formatPercentage } from 'common/format';

const AVATAR_DAMAGE_INCREASE = 0.2;

class Avatar extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.AVATAR_TALENT.id);
  }

  get uptime() {
    return this.combatants.getBuffUptime(SPELLS.AVATAR_TALENT.id) / this.owner.fightDuration;
  }

  on_byPlayer_damage(event) {
    if (!this.combatants.selected.hasBuff(SPELLS.AVATAR_TALENT.id)) {
      return;
    }
    
    this.bonusDmg += calculateEffectiveDamage(event, AVATAR_DAMAGE_INCREASE);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.AVATAR_TALENT.id} />}
        value={`${formatPercentage(this.uptime)}%`}
        label={`Uptime`}
        tooltip={`${formatNumber(this.bonusDmg)} damage contributed
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default Avatar;
