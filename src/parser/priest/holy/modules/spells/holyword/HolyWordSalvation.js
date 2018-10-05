import SPELLS from 'common/SPELLS/index';
import HolyWordBase from './HolyWordBase';

const HOLY_WORD_SERENDIPITY_REDUCTION = 6000;

class HolyWordSalvation extends HolyWordBase {
  constructor(...args) {
    super(...args);

    this.serendipityReduction = 30000;
    this.spellId = SPELLS.HOLY_WORD_SALVATION_TALENT.id;
    this.manaCost = 6000;
    this.serendipityProccers = {
      [SPELLS.HOLY_WORD_SERENITY.id]: {
        baseReduction: () => {
          return HOLY_WORD_SERENDIPITY_REDUCTION;
        },
        lightOfTheNaaruReduction: () => {
          return HOLY_WORD_SERENDIPITY_REDUCTION;
        },
        apotheosisReduction: () => {
          return HOLY_WORD_SERENDIPITY_REDUCTION;
        },
      },
      [SPELLS.HOLY_WORD_SANCTIFY.id]: {
        baseReduction: () => {
          return HOLY_WORD_SERENDIPITY_REDUCTION;
        },
        lightOfTheNaaruReduction: () => {
          return HOLY_WORD_SERENDIPITY_REDUCTION;
        },
        apotheosisReduction: () => {
          return HOLY_WORD_SERENDIPITY_REDUCTION;
        },
      },
    };
  }
}

export default HolyWordSalvation;
