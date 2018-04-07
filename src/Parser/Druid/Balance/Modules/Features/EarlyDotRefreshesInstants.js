import SPELLS from 'common/SPELLS';

import StatTracker from 'Parser/Core/Modules/StatTracker';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';
import CoreEarlyDotRefreshesInstants from 'Parser/Core/Modules/EarlyDotRefreshes/EarlyDotRefreshesInstants';
import suggest from 'Parser/Core/Modules/EarlyDotRefreshes/EarlyDotRefreshesInstantsSuggestion';

const NATURES_BALANCE_MOONFIRE_EXTENSION_MS = 6000;
const NATURES_BALANCE_SUNFIRE_EXTENSION_MS = 4000;
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
    ...EarlyDotRefreshesInstants.dependencies,
    statTracker: StatTracker,
  };

  dots = DOTS;
  naturesBalance;

  on_initialized() {
    this.naturesBalance = this.combatants.selected.hasTalent(SPELLS.NATURES_BALANCE_TALENT.id);
    super.on_initialized();
  }

  // Check for Stellar Drift on both the cast event and the next event, since it might have expired mid GCD.
  couldCastWhileMoving(castEvent, endEvent) {
    if (this.combatants.selected.hasBuff(SPELLS.STELLAR_DRIFT.id, castEvent.timestamp) && this.combatants.selected.hasBuff(SPELLS.STELLAR_DRIFT.id, endEvent.timestamp)) {
      return SPELLS.STELLAR_DRIFT.name;
    }
    return false;
  }

  // With Nature's Balance, extend all Sunfires on Solar Wrath cast.
  on_byPlayer_cast(event) {
    super.on_byPlayer_cast(event);
    if (!this.naturesBalance || event.ability.guid !== SPELLS.SOLAR_WRATH_MOONKIN.id) {
       return;
    }
    const extension = NATURES_BALANCE_SUNFIRE_EXTENSION_MS / ( 1 + this.statTracker.currentHastePercentage);
    for (const [targetID, expirationTimestamp] of Object.entries(this.targets[SPELLS.SUNFIRE.id])) {
      if (expirationTimestamp > event.timestamp) {
        this.extendDot(SPELLS.SUNFIRE.id, targetID, extension, event.timestamp);
      }
    }
  }

  // With Nature's Balance, extend Lunar Strike on all targets hit by Lunar Strike.
  on_byPlayer_damage(event) {
    if (!this.naturesBalance || event.ability.guid !== SPELLS.LUNAR_STRIKE.id) {
      return;
    }
    const targetID = encodeTargetString(event.targetID, event.targetInstance);
    if (this.targets[SPELLS.MOONFIRE_BEAR.id][targetID] > event.timestamp) {
      const extension = NATURES_BALANCE_MOONFIRE_EXTENSION_MS / ( 1 + this.statTracker.currentHastePercentage);
      this.extendDot(SPELLS.MOONFIRE_BEAR.id, targetID, extension, event.timestamp);
    }
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
      style: 'percent',
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
      style: 'percent',
    };
  }

  suggestions(when) {
    suggest(when, this.suggestionThresholdsMoonfire);
    suggest(when, this.suggestionThresholdsSunfire);
  }
}

export default EarlyDotRefreshesInstants;
