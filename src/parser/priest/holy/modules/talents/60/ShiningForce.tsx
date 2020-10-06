import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import { ApplyDebuffEvent, CastEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

// Example Log: /report/NcKyHD94nrj31tG2/10-Mythic+Zek'voz+-+Kill+(9:35)/3-旧时印月
class ShiningForce extends Analyzer {
  shiningForceCasts = 0;
  shiningForceHits = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SHINING_FORCE_TALENT.id);
  }

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHINING_FORCE_TALENT.id) {
      this.shiningForceCasts += 1;
    }
  }

  on_byPlayer_applydebuff(event: ApplyDebuffEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHINING_FORCE_TALENT.id) {
      this.shiningForceHits += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(4)}
      >
        <BoringSpellValueText spell={SPELLS.SHINING_FORCE_TALENT}>
          {this.shiningForceHits} Knock Back(s)
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ShiningForce;
