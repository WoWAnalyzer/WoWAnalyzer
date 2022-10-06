import { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import EarlyDotRefreshesCore from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshes';
import suggest from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshesSuggestionByCount';
import { TALENTS_DRUID } from 'common/TALENTS';

// FIXME whyyyy
const DOTS = [
  {
    name: 'Stellar Flare',
    debuffId: TALENTS_DRUID.STELLAR_FLARE_TALENT.id,
    castId: TALENTS_DRUID.STELLAR_FLARE_TALENT.id,
    duration: 24000,
  },
];

const MINOR_THRESHOLD = 0.9;
const AVERAGE_THRESHOLD = 0.8;
const MAJOR_THRESHOLD = 0.6;

class EarlyDotRefreshes extends EarlyDotRefreshesCore {
  get suggestionThresholdsStellarFlare() {
    return {
      spell: TALENTS_DRUID.STELLAR_FLARE_TALENT,
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
      spell: TALENTS_DRUID.STELLAR_FLARE_TALENT,
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
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.STELLAR_FLARE_TALENT);
  }

  suggestions(when: When) {
    suggest(when, this.suggestionThresholdsStellarFlare);
  }
}

export default EarlyDotRefreshes;
