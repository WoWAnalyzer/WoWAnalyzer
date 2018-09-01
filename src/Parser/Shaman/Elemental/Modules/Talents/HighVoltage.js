import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

const EXTRA_OVERLOAD_CHANCE=0.5;

class HighVoltage extends Analyzer {
  damageDoneByOverloads = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HIGH_VOLTAGE_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if ((event.ability.guid !== SPELLS.LIGHTNING_BOLT_OVERLOAD_HIT.id) && (event.ability.guid !== SPELLS.CHAIN_LIGHTNING_OVERLOAD.id)) {
      return;
    }

    this.damageDoneByOverloads += event.amount;
  }

  get damageGained() {
    return (EXTRA_OVERLOAD_CHANCE / (EXTRA_OVERLOAD_CHANCE+1)) * this.damageDoneByOverloads;
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
        icon={<SpellIcon id={SPELLS.HIGH_VOLTAGE_TALENT.id} />}
        value={`~ ${formatPercentage(this.damagePercent)} %`}
        label="Of total damage"
        tooltip={`Contributed ~${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL;
}

export default HighVoltage;
