import React from 'react';
import SPELLS from 'common/SPELLS/index';
import { formatThousands, formatNumber } from 'common/format';
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

  get healingPerSecond() {
    return this.healthGained / this.owner.fightDuration * 1000;
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.NATURES_GUARDIAN_TALENT.id}
        value={`${formatThousands(this.healingPerSecond)} HPS`}
        label="Nature's Guardian healing"
        tooltip={<>
          Nature's Guardian was used <strong>{this.procCount}</strong> time(s) and healed you for a total of <strong>{formatNumber(this.healthGained)}</strong>.
        </>}
      />
    );
  }
}

export default NaturesGuardian;
