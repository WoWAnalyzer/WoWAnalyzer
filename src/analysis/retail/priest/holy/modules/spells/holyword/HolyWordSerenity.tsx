import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { Options } from 'parser/core/Analyzer';

import HolyWordBase from './HolyWordBase';

const GREATER_HEAL_SERENDIPITY_REDUCTION = 6000;
const FLASH_HEAL_SERENDIPITY_REDUCTION = 6000;
const BINDING_HEAL_SERENDIPITY_REDUCTION = 3000;
const PRAYER_OF_MENDING_SERENDIPITY_REDUCTION = 4000;

class HolyWordSerenity extends HolyWordBase {
  constructor(options: Options) {
    super(options);

    this.spellId = TALENTS.HOLY_WORD_SERENITY_TALENT.id;
    this.manaCost = 4000;
    this.serendipityProccers = {
      [SPELLS.GREATER_HEAL.id]: {
        baseReduction: () => GREATER_HEAL_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () =>
          GREATER_HEAL_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => GREATER_HEAL_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      },
      [SPELLS.FLASH_HEAL.id]: {
        baseReduction: () => FLASH_HEAL_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () =>
          FLASH_HEAL_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => FLASH_HEAL_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      },
      [TALENTS.BINDING_HEALS_TALENT.id]: {
        baseReduction: () => BINDING_HEAL_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () =>
          BINDING_HEAL_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => BINDING_HEAL_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      },
    };

    if (this.selectedCombatant.hasLegendary(SPELLS.HARMONIOUS_APPARATUS)) {
      this.serendipityProccers[TALENTS.PRAYER_OF_MENDING_TALENT.id] = {
        baseReduction: () => PRAYER_OF_MENDING_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () =>
          PRAYER_OF_MENDING_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () =>
          PRAYER_OF_MENDING_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      };
    }
  }
}

export default HolyWordSerenity;
