import React from 'react';
import SPELLS from 'common/SPELLS/index';
import HolyWordBase from './HolyWordBase';

class HolyWordSanctify extends HolyWordBase {
  constructor(...args) {
    super(...args);

    this.spellId = SPELLS.HOLY_WORD_SANCTIFY.id;
    this.serendipityProccers = {
      [SPELLS.PRAYER_OF_HEALING.id]: 1.0,
      [SPELLS.BINDING_HEAL_TALENT.id]: 0.5,
    };
    if (this.selectedCombatant.hasTrait(SPELLS.WORD_OF_MENDING.id)) {
      this.serendipityProccers[SPELLS.PRAYER_OF_MENDING_CAST.id] = () => 2000;
    }
  }
}

export default HolyWordSanctify;
