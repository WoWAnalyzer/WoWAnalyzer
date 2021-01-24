import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import Events, { ApplyDebuffEvent, CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// Example Log: /report/NcKyHD94nrj31tG2/10-Mythic+Zek'voz+-+Kill+(9:35)/3-旧时印月
class ShiningForce extends Analyzer {
  shiningForceCasts = 0;
  shiningForceHits = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SHINING_FORCE_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHINING_FORCE_TALENT), this.onCast);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.SHINING_FORCE_TALENT), this.onApplyDebuff);
  }

  onCast(event: CastEvent) {
    this.shiningForceCasts += 1;
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    this.shiningForceHits += 1;
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
