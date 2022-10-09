import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { Options } from 'parser/core/Analyzer';

import HolyWordBase from './HolyWordBase';

const PRAYER_OF_HEALING_SERENDIPITY_REDUCTION = 6000;
const RENEW_SERENDIPITY_REDUCTION = 2000;
const BINDING_HEAL_SERENDIPITY_REDUCTION = 3000;
const CIRCLE_OF_HEALING_SERENDIPITY_REDUCTION = 4000;

class HolyWordSanctify extends HolyWordBase {
  constructor(options: Options) {
    super(options);

    this.serendipityReduction = 6000;
    this.spellId = TALENTS.HOLY_WORD_SANCTIFY_TALENT.id;
    this.manaCost = 5000;
    this.serendipityProccers = {
      [TALENTS.PRAYER_OF_HEALING_TALENT.id]: {
        baseReduction: () => PRAYER_OF_HEALING_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () =>
          PRAYER_OF_HEALING_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () =>
          PRAYER_OF_HEALING_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      },
      [TALENTS.BINDING_HEALS_TALENT.id]: {
        baseReduction: () => BINDING_HEAL_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () =>
          BINDING_HEAL_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => BINDING_HEAL_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      },
      [TALENTS.RENEW_TALENT.id]: {
        baseReduction: () => RENEW_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () => RENEW_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => RENEW_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      },
    };
    if (this.selectedCombatant.hasLegendary(SPELLS.HARMONIOUS_APPARATUS)) {
      this.serendipityProccers[TALENTS.CIRCLE_OF_HEALING_TALENT.id] = {
        baseReduction: () => CIRCLE_OF_HEALING_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () =>
          CIRCLE_OF_HEALING_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () =>
          CIRCLE_OF_HEALING_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      };
    }
  }
}

export default HolyWordSanctify;
