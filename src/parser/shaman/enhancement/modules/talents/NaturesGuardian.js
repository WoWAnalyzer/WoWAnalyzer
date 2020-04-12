import React from 'react';
import SPELLS from 'common/SPELLS/index';
import { formatNumber, formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';

class NaturesGuardian extends Analyzer {

  healthGained = 0;
  procCount = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.NATURES_GUARDIAN_TALENT.id);
  }

  on_toPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.NATURES_GUARDIAN_HEAL.id) {
      return;
    }

    this.procCount++;
    this.healthGained += event.amount;
  }

  get healingPercent() {
    return this.owner.getPercentageOfTotalHealingDone(this.healthGained);
  }

  get healingPerSecond() {
    return this.healthGained / this.owner.fightDuration * 1000;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.NATURES_GUARDIAN_TALENT.id}
        value={`${formatPercentage(this.healingPercent)} %`}
        label="Nature's Guardian Healing"
        tooltip={<>
          Nature's Guardian was used <strong>{this.procCount}</strong> time(s) and healed you for:
          <ul>
            <li><strong>{formatNumber(this.healingPerSecond)}</strong> HPS</li>
            <li><strong>{formatNumber(this.healthGained)}</strong></li>
          </ul>
        </>}
      />
    );
  }
}

export default NaturesGuardian;
