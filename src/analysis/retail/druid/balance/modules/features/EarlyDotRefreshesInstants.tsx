import SPELLS from 'common/SPELLS';
import { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreEarlyDotRefreshesInstants from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshesInstants';
import suggest from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshesInstantsSuggestion';
import StatTracker from 'parser/shared/modules/StatTracker';

const DOTS = [
  {
    name: 'Moonfire',
    debuffId: SPELLS.MOONFIRE_DEBUFF.id,
    castId: SPELLS.MOONFIRE_CAST.id,
    duration: 22000,
    movementFiller: true,
  },
  {
    name: 'Sunfire',
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
  get suggestionThresholdsMoonfire() {
    return {
      spell: SPELLS.MOONFIRE_DEBUFF,
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

  get suggestionThresholdsSunfire() {
    return {
      spell: SPELLS.SUNFIRE,
      count: this.casts[DOTS[1].castId].badCasts,
      actual: this.badCastsPercent(DOTS[1].castId),
      isGreaterThan: {
        minor: 1 - MINOR_THRESHOLD,
        average: 1 - AVERAGE_THRESHOLD,
        major: 1 - MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsMoonfireEfficiency() {
    return {
      spell: SPELLS.MOONFIRE_DEBUFF,
      actual: 1 - this.badCastsPercent(DOTS[0].castId),
      isLessThan: {
        minor: MINOR_THRESHOLD,
        average: AVERAGE_THRESHOLD,
        major: MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsSunfireEfficiency() {
    return {
      spell: SPELLS.SUNFIRE,
      actual: 1 - this.badCastsPercent(DOTS[1].castId),
      isLessThan: {
        minor: MINOR_THRESHOLD,
        average: AVERAGE_THRESHOLD,
        major: MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    ...CoreEarlyDotRefreshesInstants.dependencies,
    statTracker: StatTracker,
  };
  static dots = DOTS;

  // Check for Stellar Drift on both the cast event and the next event, since it might have expired mid GCD.
  couldCastWhileMoving(castEvent: CastEvent, endEvent: CastEvent) {
    if (
      this.selectedCombatant.hasBuff(SPELLS.STELLAR_DRIFT.id, castEvent.timestamp) &&
      this.selectedCombatant.hasBuff(SPELLS.STELLAR_DRIFT.id, endEvent.timestamp)
    ) {
      return SPELLS.STELLAR_DRIFT.name;
    }
    return '';
  }

  suggestions(when: When) {
    suggest(when, this.suggestionThresholdsMoonfire);
    suggest(when, this.suggestionThresholdsSunfire);
  }
}

export default EarlyDotRefreshesInstants;
