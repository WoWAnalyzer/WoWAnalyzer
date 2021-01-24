import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';

import HolyWordBase from './HolyWordBase';

const GREATER_HEAL_SERENDIPITY_REDUCTION = 6000;
const FLASH_HEAL_SERENDIPITY_REDUCTION = 6000;
const BINDING_HEAL_SERENDIPITY_REDUCTION = 3000;
const PRAYER_OF_MENDING_SERENDIPITY_REDUCTION = 4000;

class HolyWordSerenity extends HolyWordBase {
  constructor(options: Options) {
    super(options);

    this.spellId = SPELLS.HOLY_WORD_SERENITY.id;
    this.manaCost = 4000;
    this.serendipityProccers = {
      [SPELLS.GREATER_HEAL.id]: {
        baseReduction: () => GREATER_HEAL_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () => GREATER_HEAL_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => GREATER_HEAL_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      },
      [SPELLS.FLASH_HEAL.id]: {
        baseReduction: () => FLASH_HEAL_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () => FLASH_HEAL_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => FLASH_HEAL_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      },
      [SPELLS.BINDING_HEAL_TALENT.id]: {
        baseReduction: () => BINDING_HEAL_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () => BINDING_HEAL_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => BINDING_HEAL_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      },
    };

    if (this.selectedCombatant.hasLegendaryByBonusID(SPELLS.HARMONIOUS_APPARATUS.bonusID)) {
      this.serendipityProccers[SPELLS.PRAYER_OF_MENDING_CAST.id] = {
        baseReduction: () => PRAYER_OF_MENDING_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () => PRAYER_OF_MENDING_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => PRAYER_OF_MENDING_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
      };
    }
  }
}

export default HolyWordSerenity;
