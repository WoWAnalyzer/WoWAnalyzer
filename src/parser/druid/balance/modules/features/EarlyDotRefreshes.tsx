import SPELLS from 'common/SPELLS';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { Options } from 'parser/core/Analyzer';

import EarlyDotRefreshesCore from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshes';
import suggest from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshesSuggestionByCount';

const DOTS = [
  {
    name: 'Stellar Flare',
    debuffId: SPELLS.STELLAR_FLARE_TALENT.id,
    castId: SPELLS.STELLAR_FLARE_TALENT.id,
    duration: 24000,
  },
];

const MINOR_THRESHOLD = 0.9;
const AVERAGE_THRESHOLD = 0.8;
const MAJOR_THRESHOLD = 0.6;

class EarlyDotRefreshes extends EarlyDotRefreshesCore {
  get suggestionThresholdsStellarFlare() {
    return {
      spell: SPELLS.STELLAR_FLARE_TALENT,
      count: this.casts[DOTS[0].castId].badCasts,
      actual: this.badCastsPercent(DOTS[0].castId),
      isGreaterThan: {
        minor: 1 - MINOR_THRESHOLD,
        average: 1 - AVERAGE_THRESHOLD,
        major: 1 - MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsStellarFlareEfficiency() {
    return {
      spell: SPELLS.STELLAR_FLARE_TALENT,
      actual: 1 - this.badCastsPercent(DOTS[0].castId),
      isLessThan: {
        minor: MINOR_THRESHOLD,
        average: AVERAGE_THRESHOLD,
        major: MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dots = DOTS;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STELLAR_FLARE_TALENT.id);
  }

  suggestions(when: When) {
    suggest(when, this.suggestionThresholdsStellarFlare);
  }
}

export default EarlyDotRefreshes;
