import TALENTS from 'common/TALENTS/priest';
import { Options } from 'parser/core/Analyzer';

import HolyWordBase from './HolyWordBase';

const HOLY_WORD_SERENDIPITY_REDUCTION = 30000;

class HolyWordSalvation extends HolyWordBase {
  constructor(options: Options) {
    super(options);

    this.serendipityReduction = 30000;
    this.spellId = TALENTS.HOLY_WORD_SALVATION_TALENT.id;
    this.manaCost = 6000;
    this.serendipityProccers = {
      [TALENTS.HOLY_WORD_SERENITY_TALENT.id]: {
        baseReduction: () => HOLY_WORD_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () => HOLY_WORD_SERENDIPITY_REDUCTION,
        apotheosisReduction: () => HOLY_WORD_SERENDIPITY_REDUCTION,
      },
      [TALENTS.HOLY_WORD_SANCTIFY_TALENT.id]: {
        baseReduction: () => HOLY_WORD_SERENDIPITY_REDUCTION,
        lightOfTheNaaruReduction: () => HOLY_WORD_SERENDIPITY_REDUCTION,
        apotheosisReduction: () => HOLY_WORD_SERENDIPITY_REDUCTION,
      },
    };
  }
}

export default HolyWordSalvation;
