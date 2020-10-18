import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import Events, { ApplyDebuffEvent, CastEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

// Example Log: /report/nWVBjGLrDQvahH7M/15-Mythic+Taloc+-+Kill+(6:50)/3-Claver
class PsychicVoice extends Analyzer {
  psychicScreamCasts = 0;
  psychicScreamHits = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PSYCHIC_VOICE_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PSYCHIC_SCREAM), this.onCast);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.PSYCHIC_SCREAM), this.onApplyDebuff);
  }

  onCast(event: CastEvent) {
    this.psychicScreamCasts += 1;
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    this.psychicScreamHits += 1;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(4)}
      >
        <BoringSpellValueText spell={SPELLS.PSYCHIC_VOICE_TALENT}>
          ${this.psychicScreamHits} Targets Feared
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PsychicVoice;
