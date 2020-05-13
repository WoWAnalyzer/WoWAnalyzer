import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TalentStatisticBox, { STATISTIC_ORDER } from 'interface/others/TalentStatisticBox';
import React from 'react';

// Example Log: /report/nWVBjGLrDQvahH7M/15-Mythic+Taloc+-+Kill+(6:50)/3-Claver
class PsychicVoice extends Analyzer {
  psychicScreamCasts = 0;
  psychicScreamHits = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PSYCHIC_VOICE_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PSYCHIC_SCREAM.id) {
      this.psychicScreamCasts += 1;
    }
  }

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PSYCHIC_SCREAM.id) {
      this.psychicScreamHits += 1;
    }
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.PSYCHIC_VOICE_TALENT.id}
        value={`${this.psychicScreamHits} Targets Feared`}
        position={STATISTIC_ORDER.CORE(4)}
      />
    );
  }
}

export default PsychicVoice;
