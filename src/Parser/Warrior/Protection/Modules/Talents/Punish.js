import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import { formatNumber, formatPercentage } from 'common/format';

const PUNISH_DAMAGE_INCREASE = 0.2;

class Punish extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.PUNISH_TALENT.id);
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.PUNISH_DEBUFF.id) / this.owner.fightDuration;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.SHIELD_SLAM.id) {
      return;
    }
    this.bonusDmg += calculateEffectiveDamage(event, PUNISH_DAMAGE_INCREASE);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PUNISH_TALENT.id} />}
        value={`${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label="Damage contributed"
        tooltip={`
          Punish added a total of ${formatNumber(this.bonusDmg)} damage to your Shield Slams (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%). </br>
          ${formatPercentage(this.uptime)}% debuff uptime.
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default Punish;
