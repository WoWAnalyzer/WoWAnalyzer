import React from 'react';
import HolyWordBase from './HolyWordBase';
import SPELLS from 'common/SPELLS';

class HolyWordSerenity extends HolyWordBase {
  constructor(...args) {
    super(...args);

    this.spellId = SPELLS.HOLY_WORD_SERENITY.id;
    this.serendipityProccers = {
      [SPELLS.GREATER_HEAL.id]: 1.0,
      [SPELLS.FLASH_HEAL.id]: 1.0,
      [SPELLS.BINDING_HEAL_TALENT.id]: 0.5,
    };
  }
}

export default HolyWordSerenity;
