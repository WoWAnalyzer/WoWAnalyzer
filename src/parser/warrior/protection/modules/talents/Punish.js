import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/core/modules/Enemies';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { formatNumber, formatPercentage } from 'common/format';

const PUNISH_DAMAGE_INCREASE = 0.2;

class Punish extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PUNISH_TALENT.id);
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
