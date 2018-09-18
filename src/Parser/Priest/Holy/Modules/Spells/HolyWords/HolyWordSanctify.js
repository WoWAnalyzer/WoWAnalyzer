import React from 'react';
import SPELLS from 'common/SPELLS/index';
import HolyWordBase from './HolyWordBase';

class HolyWordSanctify extends HolyWordBase {
  constructor(...args) {
    super(...args);

    if (this.selectedCombatant.hasTrait(SPELLS.WORD_OF_MENDING.id)) {
      this.serendipityProccers[SPELLS.PRAYER_OF_MENDING_CAST.id] = () => 2000;
    }
  }
}

export default HolyWordSanctify;
