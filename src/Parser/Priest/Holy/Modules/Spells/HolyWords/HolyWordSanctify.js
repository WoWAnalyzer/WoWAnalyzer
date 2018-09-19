import React from 'react';
import SPELLS from 'common/SPELLS/index';
import HolyWordBase from './HolyWordBase';

class HolyWordSanctify extends HolyWordBase {
  constructor(...args) {
    super(...args);

    this.spellId = SPELLS.HOLY_WORD_SANCTIFY.id;
    this.manaCost = 5000;
    this.serendipityProccers = {
      [SPELLS.PRAYER_OF_HEALING.id]: {
        baseReduction: () => {
          return this.serendipityReduction;
        },
        lightOfTheNaaruReduction: () => {
          return this.serendipityReduction * this.lightOfTheNaruMultiplier;
        },
        apotheosisReduction: () => {
          return this.serendipityReduction * this.apotheosisMultiplier;
        },
      },
      [SPELLS.BINDING_HEAL_TALENT.id]: {
        baseReduction: () => {
          return this.serendipityReduction * .5;
        },
        lightOfTheNaaruReduction: () => {
          return this.serendipityReduction * this.lightOfTheNaruMultiplier * .5;
        },
        apotheosisReduction: () => {
          return this.serendipityReduction * this.apotheosisMultiplier * .5;
        },
      },
    };

    // If you have word of mending, there is a set reduction for PoM
    if (this.selectedCombatant.hasTrait(SPELLS.WORD_OF_MENDING.id)) {
      this.serendipityProccers[SPELLS.PRAYER_OF_MENDING_CAST.id] = {
        baseReduction: () => {
          return 2000;
        },
        lightOfTheNaaruReduction: () => {
          return 2000 * this.lightOfTheNaruMultiplier;
        },
        apotheosisReduction: () => {
          return 2000 * this.apotheosisMultiplier;
        },
      };
    }
  }
}

export default HolyWordSanctify;
