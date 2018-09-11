import React from 'react';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

class LightningShield extends Analyzer {

  damageGained=0;
  overchargeCount=0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LIGHTNING_SHIELD_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid!==SPELLS.LIGHTNING_SHIELD_TALENT.id) {
      return;
    }
    this.damageGained += event.amount;
  }

  on_byPlayer_energize(event) {
    if (event.ability.guid!==SPELLS.LIGHTNING_SHIELD_OVERCHARGE.id) {
      return;
    }
    this.maelstromGained += event.amount;
  }

  on_byPlayer_buffapply(event) {
    if (event.ability.guid!==SPELLS.LIGHTNING_SHIELD_OVERCHARGE.id) {
      return;
    }
    this.overchargeCount += 1;

  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageGained);
  }

  get damagePerSecond() {
    return this.damageGained / (this.owner.fightDuration / 1000);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.LIGHTNING_SHIELD_TALENT.id} />}
        value={`${formatPercentage(this.damagePercent)} %`}
        label="Of total damage"
        tooltip={`Contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage).`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default LightningShield;
