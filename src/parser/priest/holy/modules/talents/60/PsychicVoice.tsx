import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import { ApplyDebuffEvent, CastEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

// Example Log: /report/nWVBjGLrDQvahH7M/15-Mythic+Taloc+-+Kill+(6:50)/3-Claver
class PsychicVoice extends Analyzer {
  psychicScreamCasts = 0;
  psychicScreamHits = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PSYCHIC_VOICE_TALENT.id);
  }

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PSYCHIC_SCREAM.id) {
      this.psychicScreamCasts += 1;
    }
  }

  on_byPlayer_applydebuff(event: ApplyDebuffEvent) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PSYCHIC_SCREAM.id) {
      this.psychicScreamHits += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(4)}
      >
        <BoringSpellValueText spell={SPELLS.PSYCHIC_VOICE_TALENT}>
          `${this.psychicScreamHits} Targets Feared`
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PsychicVoice;
