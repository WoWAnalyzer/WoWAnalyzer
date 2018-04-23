import SPELLS from 'common/SPELLS';

import EarlyDotRefreshesCore from 'Parser/Core/Modules/EarlyDotRefreshes/EarlyDotRefreshes';
import suggest from 'Parser/Core/Modules/EarlyDotRefreshes/EarlyDotRefreshesSuggestion';

const DOTS = [
  {
    name: "Stellar Flare",
    debuffId: SPELLS.STELLAR_FLARE_TALENT.id,
    castId: SPELLS.STELLAR_FLARE_TALENT.id,
    duration: 24000,
  },
];

class EarlyDotRefreshes extends EarlyDotRefreshesCore {
  dots = DOTS;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.STELLAR_FLARE_TALENT.id);
    if(this.active) {
      super.on_initialized();
    }
  }

  get suggestionThresholdsStellarFlare() {
    return {
      spell: SPELLS.STELLAR_FLARE_TALENT,
      count: this.badCasts[DOTS[0].castId],
      actual: this.badCastsPercent(DOTS[0].castId),
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.2,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholdsStellarFlareEfficiency() {
    return {
      spell: SPELLS.STELLAR_FLARE_TALENT,
      actual: 1 - this.badCastsPercent(DOTS[0].castId),
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    suggest(when, this.suggestionThresholdsStellarFlare);
  }
}

export default EarlyDotRefreshes;
