import SPELLS from 'common/SPELLS';

import StatTracker from 'Parser/Core/Modules/StatTracker';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';
import CoreEarlyDotRefreshesInstants from 'Parser/Core/Modules/EarlyDotRefreshes/EarlyDotRefreshesInstants';
import suggest from 'Parser/Core/Modules/EarlyDotRefreshes/EarlyDotRefreshesInstantsSuggestion';

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

class EarlyDotRefreshesInstants extends CoreEarlyDotRefreshesInstants {
  static dependencies = {
    ...CoreEarlyDotRefreshesInstants.dependencies,
    statTracker: StatTracker,
  };

  static dots = DOTS;

  constructor(...args) {
    super(...args);
  }

  // Check for Stellar Drift on both the cast event and the next event, since it might have expired mid GCD.
  couldCastWhileMoving(castEvent, endEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.STELLAR_DRIFT.id, castEvent.timestamp) && this.selectedCombatant.hasBuff(SPELLS.STELLAR_DRIFT.id, endEvent.timestamp)) {
      return SPELLS.STELLAR_DRIFT.name;
    }
    return false;
  }

  get suggestionThresholdsMoonfire() {
    return {
      spell: SPELLS.MOONFIRE_BEAR,
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

  get suggestionThresholdsSunfire() {
    return {
      spell: SPELLS.SUNFIRE,
      count: this.badCasts[DOTS[1].castId],
      actual: this.badCastsPercent(DOTS[1].castId),
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.2,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholdsMoonfireEfficiency() {
    return {
      spell: SPELLS.MOONFIRE_BEAR,
      actual: 1 - this.badCastsPercent(DOTS[0].castId),
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholdsSunfireEfficiency() {
    return {
      spell: SPELLS.SUNFIRE,
      actual: 1 - this.badCastsPercent(DOTS[1].castId),
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    suggest(when, this.suggestionThresholdsMoonfire);
    suggest(when, this.suggestionThresholdsSunfire);
  }
}

export default EarlyDotRefreshesInstants;
