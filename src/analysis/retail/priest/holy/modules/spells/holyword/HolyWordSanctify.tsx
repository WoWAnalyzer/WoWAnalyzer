import TALENTS from 'common/TALENTS/priest';
import { Options } from 'parser/core/Analyzer';

import HolyWordBase from './HolyWordBase';

const PRAYER_OF_HEALING_SERENDIPITY_REDUCTION = 6000;
const RENEW_SERENDIPITY_REDUCTION = 2000;

class HolyWordSanctify extends HolyWordBase {
  constructor(options: Options) {
    super(options);

    this.spellId = TALENTS.HOLY_WORD_SANCTIFY_TALENT.id;
    this.manaCost = 5000;
    this.serendipityProccers = {
      [TALENTS.PRAYER_OF_HEALING_TALENT.id]: {
        baseReduction: () => PRAYER_OF_HEALING_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () =>
          PRAYER_OF_HEALING_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () =>
          PRAYER_OF_HEALING_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
        lightOfTheNaaruAndApotheosisReduction: () =>
          PRAYER_OF_HEALING_SERENDIPITY_REDUCTION *
          this.lightOfTheNaruMultiplier *
          this.apotheosisMultiplier,
      },
      [TALENTS.RENEW_TALENT.id]: {
        baseReduction: () => RENEW_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () => RENEW_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => RENEW_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
        lightOfTheNaaruAndApotheosisReduction: () =>
          RENEW_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier * this.apotheosisMultiplier,
      },
    };
    if (this.harmoniousApparatusActive) {
      this.serendipityProccers[TALENTS.CIRCLE_OF_HEALING_TALENT.id] = {
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
