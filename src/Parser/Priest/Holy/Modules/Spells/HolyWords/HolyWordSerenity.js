import SPELLS from 'common/SPELLS';
import HolyWordBase from './HolyWordBase';

class HolyWordSerenity extends HolyWordBase {
  constructor(...args) {
    super(...args);

    this.spellId = SPELLS.HOLY_WORD_SERENITY.id;
    this.manaCost = 4000;
    this.serendipityProccers = {
      [SPELLS.GREATER_HEAL.id]: {
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
      [SPELLS.FLASH_HEAL.id]: {
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
      [SPELLS.BINDING_HEAL_TALENT.id]: {
        baseReduction: () => {
          return this.serendipityReduction * .5;
        },
        lightOfTheNaaruReduction: () => {
          return this.serendipityReduction * this.lightOfTheNaruMultiplier * .5;
        },
        apotheosisReduction: () => {
          return this.serendipityReduction * this.apotheosisMultiplier * .5;
        },
      },
    };
  }
}

export default HolyWordSerenity;
