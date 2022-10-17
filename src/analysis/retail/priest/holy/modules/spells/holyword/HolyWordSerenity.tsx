import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';

import HolyWordBase from './HolyWordBase';

const GREATER_HEAL_SERENDIPITY_REDUCTION = 6000;
const FLASH_HEAL_SERENDIPITY_REDUCTION = 6000;

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
        lightOfTheNaaruAndApotheosisReduction: () =>
          GREATER_HEAL_SERENDIPITY_REDUCTION *
          this.lightOfTheNaruMultiplier *
          this.apotheosisMultiplier,
      },
      [SPELLS.FLASH_HEAL.id]: {
        baseReduction: () => FLASH_HEAL_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () =>
          FLASH_HEAL_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => FLASH_HEAL_SERENDIPITY_REDUCTION * this.apotheosisMultiplier,
        lightOfTheNaaruAndApotheosisReduction: () =>
          GREATER_HEAL_SERENDIPITY_REDUCTION *
          this.lightOfTheNaruMultiplier *
          this.apotheosisMultiplier,
      },
    };

    if (this.harmoniousApparatusActive) {
      this.serendipityProccers[TALENTS.PRAYER_OF_MENDING_TALENT.id] = {
        baseReduction: () => this.apparatusReduction,
        lightOfTheNaaruReduction: () => this.apparatusReduction * this.lightOfTheNaruMultiplier,
        apotheosisReduction: () => this.apparatusReduction * this.apotheosisMultiplier,
        lightOfTheNaaruAndApotheosisReduction: () =>
          this.apparatusReduction * this.lightOfTheNaruMultiplier * this.apotheosisMultiplier,
      };
    }
  }
}

export default HolyWordSerenity;
