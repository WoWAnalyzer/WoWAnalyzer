import SPELLS from 'common/SPELLS';

import EarlyDotRefreshesCore from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshes';
import suggest from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshesSuggestion';

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
  static dots = DOTS;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STELLAR_FLARE_TALENT.id);
  }

  get suggestionThresholdsStellarFlare() {
    return {
      spell: SPELLS.STELLAR_FLARE_TALENT,
      count: this.badCasts[DOTS[0].castId],
      actual: this.badCastsPercent(DOTS[0].castId),
      isGreaterThan: {
        minor: 1 - MINOR_THRESHOLD,
        average: 1 - AVERAGE_THRESHOLD,
        major: 1 - MAJOR_THRESHOLD,
      },
      style: 'percentage',
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
      style: 'percentage',
    };
  }

  suggestions(when) {
    suggest(when, this.suggestionThresholdsStellarFlare);
  }
}

export default EarlyDotRefreshes;
