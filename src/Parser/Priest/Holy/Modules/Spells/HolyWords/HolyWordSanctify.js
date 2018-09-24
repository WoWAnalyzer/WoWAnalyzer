import SPELLS from 'common/SPELLS/index';
import HolyWordBase from './HolyWordBase';

const PRAYER_OF_HEALING_SERENDIPITY_REDUCTION = 6000;
const RENEW_SERENDIPITY_REDUCTION = 2000;
const WORD_OF_MENDING_SERENDIPITY_REDUCTION = 2000;
const BINDING_HEAL_SERENDIPITY_REDUCTION = 3000;

class HolyWordSanctify extends HolyWordBase {
  constructor(...args) {
    super(...args);

    this.serendipityReduction = 6000;
    this.spellId = SPELLS.HOLY_WORD_SANCTIFY.id;
    this.manaCost = 5000;
    this.serendipityProccers = {
      [SPELLS.PRAYER_OF_HEALING.id]: {
        baseReduction: () => {
          return PRAYER_OF_HEALING_SERENDIPITY_REDUCTION;
        },
        lightOfTheNaaruReduction: () => {
          return PRAYER_OF_HEALING_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier;
        },
        apotheosisReduction: () => {
          return PRAYER_OF_HEALING_SERENDIPITY_REDUCTION * this.apotheosisMultiplier;
        },
      },
      [SPELLS.BINDING_HEAL_TALENT.id]: {
        baseReduction: () => {
          return BINDING_HEAL_SERENDIPITY_REDUCTION;
        },
        lightOfTheNaaruReduction: () => {
          return BINDING_HEAL_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier;
        },
        apotheosisReduction: () => {
          return BINDING_HEAL_SERENDIPITY_REDUCTION * this.apotheosisMultiplier;
        },
      },
      [SPELLS.RENEW.id]: {
        baseReduction: () => {
          return RENEW_SERENDIPITY_REDUCTION;
        },
        lightOfTheNaaruReduction: () => {
          return RENEW_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier;
        },
        apotheosisReduction: () => {
          return RENEW_SERENDIPITY_REDUCTION * this.apotheosisMultiplier;
        },
      },
    };

    // If you have word of mending, there is a set reduction for PoM
    if (this.selectedCombatant.hasTrait(SPELLS.WORD_OF_MENDING.id)) {
      this.serendipityProccers[SPELLS.PRAYER_OF_MENDING_CAST.id] = {
        baseReduction: () => {
          return WORD_OF_MENDING_SERENDIPITY_REDUCTION;
        },
        lightOfTheNaaruReduction: () => {
          return WORD_OF_MENDING_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier;
        },
        apotheosisReduction: () => {
          return WORD_OF_MENDING_SERENDIPITY_REDUCTION * this.apotheosisMultiplier;
        },
      };
    }
  }
}

export default HolyWordSanctify;
