import ITEMS from 'common/ITEMS';
import SPELLS from "common/SPELLS";
import { formatThousands } from "common/format";
import { calculateSecondaryStatDefault } from 'common/stats';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/**
 * Garothi Feedback Conduit
 * Equip: Your healing effects have a chance to increase your Haste by 856 for 8 sec, stacking up to 5 times. This is more likely to occur when you heal allies who are at low health.
 *
 * This module calculates the average Haste gain over the entire fight.
 */
class GarothiFeedbackConduit extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  _hastePerStack = 0;
  _totalStacks = 0;
  get averageStacks() {
    return this._totalStacks / this.owner.fightDuration * 1000;
  }
  get averageHaste() {
    return this.averageStacks * this._hastePerStack;
  }

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.GAROTHI_FEEDBACK_CONDUIT.id);
    if (this.active) {
      const item = this.combatants.selected.getTrinket(ITEMS.GAROTHI_FEEDBACK_CONDUIT.id);
      this._hastePerStack = calculateSecondaryStatDefault(930, 856, item.itemLevel);
    }
  }

  _lastChange = null;
  _addStackUptime(stacks, uptime) {
    // When the stacks changed (either gained 1 stack or lost all stacks), we add the Haste gained so far to the total.
    const uptimeOfLastStack = uptime / 1000;
    this._totalStacks += stacks * uptimeOfLastStack;
  }
  on_byPlayer_changebuffstack(event) {
    if (event.ability.guid !== SPELLS.FEEDBACK_LOOP.id) {
      return;
    }

    if (this._lastChange) {
      // This requires the `oldStacks` since we can only add Haste after it has happened. This event also triggers when the buff drops, so this includes the last stack.
      this._addStackUptime(event.oldStacks, event.timestamp - this._lastChange.timestamp);
    }

    if (event.newStacks === 0) {
      // This makes it so the first stack being applied doesn't wrongly add Haste
      this._lastChange = null;
    } else {
      this._lastChange = event;
    }
  }

  on_finished() {
    // If the buff is still up when the fight is over we need to add the uptime of the buff that is still active
    if (this._lastChange) {
      // Since the buff is still up we need to know the current stacks so we use `newStacks`
      this._addStackUptime(this._lastChange.newStacks, this.owner.currentTimestamp - this._lastChange.timestamp);
    }
  }

  item() {
    return {
      item: ITEMS.GAROTHI_FEEDBACK_CONDUIT,
      result: `${formatThousands(this.averageHaste)} average haste rating gained`,
    };
  }
}

export default GarothiFeedbackConduit;
