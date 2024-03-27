import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { Options } from 'parser/core/Analyzer';

import HolyWordBase from './HolyWordBase';

const SMITE_SERENDIPITY_REDUCTION = 4000;

class HolyWordSanctify extends HolyWordBase {
  constructor(options: Options) {
    super(options);

    this.spellId = TALENTS.HOLY_WORD_CHASTISE_TALENT.id;
    this.manaCost = 1500;
    this.serendipityProccers = {
      [SPELLS.SMITE.id]: {
        baseReduction: () => SMITE_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () => SMITE_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => SMITE_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
        lightOfTheNaaruAndApotheosisReduction: () =>
          SMITE_SERENDIPITY_REDUCTION * this.apotheosisMultiplier * this.lightOfTheNaruMultiplier,
      },
    };

    if (this.harmoniousApparatusActive) {
      this.serendipityProccers[SPELLS.HOLY_FIRE.id] = {
        baseReduction: () => this.apparatusReduction,
        lightOfTheNaaruReduction: () => this.apparatusReduction * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => this.apparatusReduction * this.apotheosisMultiplier,
        lightOfTheNaaruAndApotheosisReduction: () =>
          this.apparatusReduction * this.lightOfTheNaruMultiplier * this.apotheosisMultiplier,
      };
    }
  }
}

export default HolyWordSanctify;
