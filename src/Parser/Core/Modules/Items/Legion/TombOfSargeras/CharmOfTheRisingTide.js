import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { calculateSecondaryStatDefault } from 'common/stats';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatTracker from 'Parser/Core/Modules/StatTracker';

const FULL_POWER_STACKS = 10;
// max window in ms after Rising Tides drops that I consider a new application to be a "full power" application
// Because the trinket has a 90s CD, I can be very generous with this window,
// I've made it large in case there's anything weird with the events, though looking at logs I haven't seen anything odd yet.
const FULL_POWER_APPLY_WINDOW_MS = 2000;

/*
 * This analyzer doesn't produce any outward product, it just ensures the stat buff from CotRT's active is handled correctly by StatTracker.
 *
 * "Use: While you remain stationary, gain 576 Haste every 1 sec stacking up to 10 times. Lasts 20 sec. (1 Min, 30 Sec Cooldown)"
 *
 * The Problem: this item's active buff shows oddly in events. The stacking portion works as expected, but once max stacks are reached the buff falls,
 * then reapplies itself with one stack... which actually has the power of the full 10 stacks.
 * Naturally this new buff has the same ID and is totally indistinguishable from the stacking variant.
 *
 * The Solution: When the buff is gained quickly after it's lost, we know this is the max-stacks version.
 * There is one special case where this won't work right, which is if for some reason the 'max power' buff is active on pull.
 * I won't be handling this case because if the player activates CotRT 10+ seconds prepull, they deserve to get wrong results.
 */
/**
 * Charm of the Rising Tide -
 * Use: While you remain stationary, gain 554 Haste every 1 sec stacking up to 10 times. Lasts 20 sec.
 */
class CharmOfTheRisingTide extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    combatants: Combatants,
  };

  hastePerStack = 0;
  _stacksFallTimestamp = undefined;
  _fullPowerActive = false;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.CHARM_OF_THE_RISING_TIDE.id);
    if (this.active) {
      const itemDetails = this.combatants.selected.getItem(ITEMS.CHARM_OF_THE_RISING_TIDE.id);
      this.hastePerStack = calculateSecondaryStatDefault(900, 576, itemDetails.itemLevel);
    }
  }

  on_toPlayer_changebuffstack(event) {
    if (event.ability.guid !== SPELLS.RISING_TIDES.id) {
      return;
    }

    // ignore prepull buff application, as they're already accounted for in combatantinfo
    // we have to check the stacks count because Entities incorrectly copies the prepull property onto changes and removal following the application
    if (event.oldStacks === 0 && event.prepull) {
      return;
    }

    if (event.newStacks === 0) {
      this._stacksFallTimestamp = this.owner.currentTimestamp;
      if (this._fullPowerActive) {
        this._makeHasteChange(-1 * FULL_POWER_STACKS, event); // full power falling off
        this._fullPowerActive = false;
        return;
      }
    }

    if (event.oldStacks === 0 && this._stacksFallTimestamp &&
      this._stacksFallTimestamp + FULL_POWER_APPLY_WINDOW_MS > this.owner.currentTimestamp) {
      this._makeHasteChange(FULL_POWER_STACKS, event); // full power activated
      this._fullPowerActive = true;
      return;
    }

    this._makeHasteChange((event.newStacks - event.oldStacks), event);
  }

  _makeHasteChange(effectiveStackChange, eventReason) {
    const ratingChange = effectiveStackChange * this.hastePerStack;
    const statChangeObj = { 'haste': ratingChange };
    this.statTracker.forceChangeStats(statChangeObj, eventReason);
  }
}

export default CharmOfTheRisingTide;
