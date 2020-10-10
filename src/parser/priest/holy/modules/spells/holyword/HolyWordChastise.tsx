import SPELLS from 'common/SPELLS/index';
import { Options } from 'parser/core/Analyzer';

import HolyWordBase from './HolyWordBase';

const SMITE_SERENDIPITY_REDUCTION = 4000;

class HolyWordSanctify extends HolyWordBase {
  constructor(options: Options) {
    super(options);

    this.spellId = SPELLS.HOLY_WORD_CHASTISE.id;
    this.resourceCost = 2000;
    this.serendipityReduction = 4000;
    this.serendipityProccers = {
      [SPELLS.SMITE.id]: {
        baseReduction: () => SMITE_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () => SMITE_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => SMITE_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      },
    };
  }
}

export default HolyWordSanctify;
