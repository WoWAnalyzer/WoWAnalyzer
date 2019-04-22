import SPELLS from 'common/SPELLS';

import StatTracker from 'parser/shared/modules/StatTracker';
import CoreEarlyDotRefreshesInstants from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshesInstants';
import suggest from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshesInstantsSuggestion';

const DOTS = [
  {
    name: "Moonfire",
    debuffId: SPELLS.MOONFIRE_BEAR.id,
    castId: SPELLS.MOONFIRE.id,
    duration: 22000,
    movementFiller: true,
  },
  {
    name: "Sunfire",
    debuffId: SPELLS.SUNFIRE.id,
    castId: SPELLS.SUNFIRE_CAST.id,
    duration: 18000,
    movementFiller: true,
  },
];

const MINOR_THRESHOLD = 0.9;
const AVERAGE_THRESHOLD = 0.8;
const MAJOR_THRESHOLD = 0.6;

class EarlyDotRefreshesInstants extends CoreEarlyDotRefreshesInstants {
  static dependencies = {
    ...CoreEarlyDotRefreshesInstants.dependencies,
    statTracker: StatTracker,
  };

  static dots = DOTS;

  // Check for Stellar Drift on both the cast event and the next event, since it might have expired mid GCD.
  couldCastWhileMoving(castEvent, endEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.STELLAR_DRIFT.id, castEvent.timestamp) && this.selectedCombatant.hasBuff(SPELLS.STELLAR_DRIFT.id, endEvent.timestamp)) {
      return SPELLS.STELLAR_DRIFT.name;
    }
    return false;
  }

  get suggestionThresholdsMoonfireEfficiency() {
    return this.makeEfficiencyThresholds(SPELLS.MOONFIRE,MINOR_THRESHOLD,AVERAGE_THRESHOLD,MAJOR_THRESHOLD);
  }

  get suggestionThresholdsSunfireEfficiency() {
    return this.makeEfficiencyThresholds(SPELLS.SUNFIRE,MINOR_THRESHOLD,AVERAGE_THRESHOLD,MAJOR_THRESHOLD);
  }

  suggestions(when) {
    suggest(when, this.makeSuggestionThresholds(SPELLS.MOONFIRE,MINOR_THRESHOLD,AVERAGE_THRESHOLD,MAJOR_THRESHOLD));
    suggest(when, this.makeSuggestionThresholds(SPELLS.SUNFIRE,MINOR_THRESHOLD,AVERAGE_THRESHOLD,MAJOR_THRESHOLD));
  }
}

export default EarlyDotRefreshesInstants;
