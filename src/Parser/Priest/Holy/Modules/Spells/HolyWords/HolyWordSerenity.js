import SPELLS from 'common/SPELLS';
import HolyWordBase from './HolyWordBase';

const GREATER_HEAL_SERENDIPITY_REDUCTION = 6000;
const FLASH_HEAL_SERENDIPITY_REDUCTION = 6000;
const BINDING_HEAL_SERENDIPITY_REDUCTION = 3000;

class HolyWordSerenity extends HolyWordBase {
  constructor(...args) {
    super(...args);

    this.spellId = SPELLS.HOLY_WORD_SERENITY.id;
    this.manaCost = 4000;
    this.serendipityProccers = {
      [SPELLS.GREATER_HEAL.id]: {
        baseReduction: () => {
          return GREATER_HEAL_SERENDIPITY_REDUCTION;
        },
        lightOfTheNaaruReduction: () => {
          return GREATER_HEAL_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier;
        },
        apotheosisReduction: () => {
          return GREATER_HEAL_SERENDIPITY_REDUCTION * this.apotheosisMultiplier;
        },
      },
      [SPELLS.FLASH_HEAL.id]: {
        baseReduction: () => {
          return FLASH_HEAL_SERENDIPITY_REDUCTION;
        },
        lightOfTheNaaruReduction: () => {
          return FLASH_HEAL_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier;
        },
        apotheosisReduction: () => {
          return FLASH_HEAL_SERENDIPITY_REDUCTION * this.apotheosisMultiplier;
        },
      },
      [SPELLS.BINDING_HEAL_TALENT.id]: {
        baseReduction: () => {
          return BINDING_HEAL_SERENDIPITY_REDUCTION;
        },
        lightOfTheNaaruReduction: () => {
          return BINDING_HEAL_SERENDIPITY_REDUCTION * this.lightOfTheNaruMultiplier;
        },
        apotheosisReduction: () => {
          return BINDING_HEAL_SERENDIPITY_REDUCTION * this.apotheosisMultiplier;
        },
      },
    };
  }
}

export default HolyWordSerenity;
