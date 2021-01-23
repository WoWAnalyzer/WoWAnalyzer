import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';

import HolyWordBase from './HolyWordBase';

const SMITE_SERENDIPITY_REDUCTION = 4000;
const HOLY_FIRE_SERENDIPITY_REDUCTION = 4000;

class HolyWordSanctify extends HolyWordBase {
  constructor(options: Options) {
    super(options);

    this.spellId = SPELLS.HOLY_WORD_CHASTISE.id;
    this.manaCost = 2000;
    this.serendipityReduction = 4000;
    this.serendipityProccers = {
      [SPELLS.SMITE.id]: {
        baseReduction: () => SMITE_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () => SMITE_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => SMITE_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      },
    };

    if (this.selectedCombatant.hasLegendaryByBonusID(SPELLS.HARMONIOUS_APPARATUS.bonusID)) {
      this.serendipityProccers[SPELLS.HOLY_FIRE.id] = {
        baseReduction: () => HOLY_FIRE_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () => HOLY_FIRE_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => HOLY_FIRE_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      };
    }
  }
}

export default HolyWordSanctify;
