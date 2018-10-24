import SPELLS from 'common/SPELLS/index';
import HolyWordBase from './HolyWordBase';

const SMITE_SERENDIPITY_REDUCTION = 4000;

class HolyWordSanctify extends HolyWordBase {
  constructor(...args) {
    super(...args);

    this.spellId = SPELLS.HOLY_WORD_CHASTISE.id;
    this.manaCost = 2000;
    this.serendipityReduction = 4000;
    this.serendipityProccers = {
      [SPELLS.SMITE.id]: {
        baseReduction: () => {
          return SMITE_SERENDIPITY_REDUCTION;
        },
        lightOfTheNaaruReduction: () => {
          return SMITE_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier;
        },
        apotheosisReduction: () => {
          return SMITE_SERENDIPITY_REDUCTION * this.apotheosisMultiplier;
        },
      },
    };
  }
}

export default HolyWordSanctify;
