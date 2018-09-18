import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
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
      this.psychicScreamCasts++;
    }
  }

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PSYCHIC_SCREAM.id) {
      this.psychicScreamHits++;
    }
  }

  statistic() {
    return (

      <TraitStatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.PSYCHIC_VOICE_TALENT.id} />}
        value={`${this.psychicScreamHits} Targets Feared`}
        label="Psychic Voice"
        position={STATISTIC_ORDER.CORE(4)}
      />

    );
  }
}

export default PsychicVoice;
