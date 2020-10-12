import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';

import HolyWordBase from './HolyWordBase';

const PRAYER_OF_HEALING_SERENDIPITY_REDUCTION = 6000;
const RENEW_SERENDIPITY_REDUCTION = 2000;
const WORD_OF_MENDING_SERENDIPITY_REDUCTION = 2000;
const BINDING_HEAL_SERENDIPITY_REDUCTION = 3000;

class HolyWordSanctify extends HolyWordBase {
  constructor(options: Options) {
    super(options);

    this.serendipityReduction = 6000;
    this.spellId = SPELLS.HOLY_WORD_SANCTIFY.id;
    this.manaCost = 5000;
    this.serendipityProccers = {
      [SPELLS.PRAYER_OF_HEALING.id]: {
        baseReduction: () => PRAYER_OF_HEALING_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () => PRAYER_OF_HEALING_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => PRAYER_OF_HEALING_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      },
      [SPELLS.BINDING_HEAL_TALENT.id]: {
        baseReduction: () => BINDING_HEAL_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () => BINDING_HEAL_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => BINDING_HEAL_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      },
      [SPELLS.RENEW.id]: {
        baseReduction: () => RENEW_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () => RENEW_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => RENEW_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      },
    };

    // If you have word of mending, there is a set reduction for PoM
    if (this.selectedCombatant.hasTrait(SPELLS.WORD_OF_MENDING.id)) {
      this.serendipityProccers[SPELLS.PRAYER_OF_MENDING_CAST.id] = {
        baseReduction: () => WORD_OF_MENDING_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () => WORD_OF_MENDING_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => WORD_OF_MENDING_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      };
    }
  }
}

export default HolyWordSanctify;
