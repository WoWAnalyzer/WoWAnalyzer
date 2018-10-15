import React from 'react';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';

import StatisticBox from 'interface/others/StatisticBox';

class CrashingStorm extends Analyzer {

  damageGained=0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CRASHING_STORM_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid!==SPELLS.CRASHING_STORM_TALENT.id){
      return;
    }
    this.damageGained+=event.amount;
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
        icon={<SpellIcon id={SPELLS.CRASHING_STORM_TALENT.id} />}
        value={`${formatPercentage(this.damagePercent)} %`}
        label="Of total damage"
        tooltip={`Contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage).`}
      />
    );
  }
}

export default CrashingStorm;
