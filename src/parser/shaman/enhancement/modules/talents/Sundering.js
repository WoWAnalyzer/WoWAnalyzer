import React from 'react';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';

import TalentStatisticBox from 'interface/others/TalentStatisticBox';

class Sundering extends Analyzer {

  damageGained=0;
  casts=0;
  hits=0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SUNDERING_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if(event.ability.guid!==SPELLS.SUNDERING_TALENT.id){
      return;
    }
    this.hits+=1;
    this.damageGained += event.amount;
  }

  on_byPlayer_cast(event) {
    if(event.ability.guid!==SPELLS.SUNDERING_TALENT.id) {
      return;
    }
    this.casts+=1;
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageGained);
  }

  get damagePerSecond() {
    return this.damageGained / (this.owner.fightDuration / 1000);
  }

  get averageHitsPerCasts() {
    return (this.hits/this.casts || 0);
  }

  statistic() {
    return (
      <TalentStatisticBox
        icon={<SpellIcon id={SPELLS.SUNDERING_TALENT.id} />}
        value={`${formatPercentage(this.damagePercent)} %`}
        label="Of total damage"
        tooltip={`Contributed ${formatNumber(this.damagePerSecond)} DPS (${formatNumber(this.damageGained)} total damage). Average Number of Targets hit: ${this.averageHitsPerCasts}.`}
      />
    );
  }
}

export default Sundering;
