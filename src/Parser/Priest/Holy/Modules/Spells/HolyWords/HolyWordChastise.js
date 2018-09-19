import SPELLS from 'common/SPELLS/index';
import HolyWordBase from './HolyWordBase';

class HolyWordSanctify extends HolyWordBase {
  constructor(...args) {
    super(...args);

    this.spellId = SPELLS.HOLY_WORD_CHASTISE.id;
    this.manaCost = 2000;
    this.serendipityReduction = 4000;
    this.serendipityProccers = {
      [SPELLS.SMITE.id]: {
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
    };
  }
}

export default HolyWordSanctify;
