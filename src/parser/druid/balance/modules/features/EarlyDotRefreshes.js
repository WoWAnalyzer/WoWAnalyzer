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

  get suggestionThresholdsStellarFlareEfficiency() {
    return this.makeSuggestionThresholds(SPELLS.STELLAR_FLARE_TALENT,MINOR_THRESHOLD,AVERAGE_THRESHOLD,MAJOR_THRESHOLD);
  }

  suggestions(when) {
    suggest(when, this.suggestionThresholdsStellarFlareEfficiency);
  }
}

export default EarlyDotRefreshes;
