import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { calculateSecondaryStatDefault } from 'common/stats';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatPercentage } from 'common/format';

/**
 * Eye of Command
 * Your melee auto attacks increase your Critical Strike by X for 10 sec, stacking up to 10 times. This effect is reset if you auto attack a different target.
 */

const MAX_STACKS = 10;

class EyeOfCommand extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  critPerStack = 0;
  currentStacks = 0;
  _totalStacks = 0;
  maxStackTime = 0;
  startOfMaxStacks = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.EYE_OF_COMMAND.id);
    if (this.active) {
      const itemDetails = this.combatants.selected.getItem(ITEMS.EYE_OF_COMMAND.id);
      this.critPerStack = calculateSecondaryStatDefault(865, 151, itemDetails.itemLevel);
    }
  }

  _lastChange = null;
  on_byPlayer_changebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LEGIONS_GAZE.id) {
      return;
    }
    if (this._lastChange) {
      // When the stacks changed (either gained 1 stack or lost all stacks), we add the Crit gained so far to the total. This requires the `oldStacks` since we can only add Crit after it has happened. This event also triggers when the buff drops, so this includes the last stack.
      const uptimeOfLastStack = (event.timestamp - this._lastChange.timestamp) / 1000;
      this._totalStacks += event.oldStacks * uptimeOfLastStack;
      if (event.oldStacks === MAX_STACKS) {
        this.maxStackTime += uptimeOfLastStack * 1000;
      }
    }
    if (event.newStacks === 0) {
      // This makes it so the first stack being applied doesn't wrongly add Crit
      this._lastChange = null;
    } else {
      this._lastChange = event;
    }
    this.currentStacks = event.newStacks;
    if (this.currentStacks === MAX_STACKS) {
      this.startOfMaxStacks = event.timestamp;
    }
  }

  on_finished() {
    if (this._lastChange) {
      const uptimeOfLastStack = (this.owner.fight.end_time - this.startOfMaxStacks) / 1000;
      this._totalStacks += this.currentStacks * uptimeOfLastStack;
      if (this.currentStacks === MAX_STACKS) {
        this.maxStackTime += uptimeOfLastStack * 1000;
      }
    }
  }

  get averageStacks() {
    return this._totalStacks / this.owner.fightDuration * 1000;
  }
  get averageCrit() {
    return this.averageStacks * this.critPerStack;
  }
  get maxStackUptime() {
    return this.maxStackTime / this.owner.fightDuration;
  }
  get totalBuffUptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.LEGIONS_GAZE.id) / this.owner.fightDuration;
  }
  item() {
    return {
      item: ITEMS.EYE_OF_COMMAND,
      result: (
        <dfn data-tip={`Your overall uptime was ${formatPercentage(this.totalBuffUptime)}%.`}>
          {formatPercentage(this.maxStackUptime)}% uptime at 10 stacks <br />
          {this.averageCrit.toFixed(0)} average crit
        </dfn>
      ),
    };
  }

}

export default EyeOfCommand;
