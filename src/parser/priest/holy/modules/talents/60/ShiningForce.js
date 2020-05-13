import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import React from 'react';

// Example Log: /report/NcKyHD94nrj31tG2/10-Mythic+Zek'voz+-+Kill+(9:35)/3-旧时印月
class ShiningForce extends Analyzer {
  shiningForceCasts = 0;
  shiningForceHits = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SHINING_FORCE_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHINING_FORCE_TALENT.id) {
      this.shiningForceCasts += 1;
    }
  }

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHINING_FORCE_TALENT.id) {
      this.shiningForceHits += 1;
    }
  }

  statistic() {
    return (

      <TalentStatisticBox
        talent={SPELLS.SHINING_FORCE_TALENT.id}
        value={`${this.shiningForceHits} Knock Back(s)`}
        position={STATISTIC_ORDER.CORE(4)}
      />

    );
  }
}

export default ShiningForce;
