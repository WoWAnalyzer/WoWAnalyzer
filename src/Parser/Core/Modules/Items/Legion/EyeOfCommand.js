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
class EyeOfCommand extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  [SPELLS.LEGIONS_GAZE.id] = {
    1: {
      start: 0,
      uptime: 0,
    },
    2: {
      start: 0,
      uptime: 0,
    },
    3: {
      start: 0,
      uptime: 0,
    },
    4: {
      start: 0,
      uptime: 0,
    },
    5: {
      start: 0,
      uptime: 0,
    },
    6: {
      start: 0,
      uptime: 0,
    },
    7: {
      start: 0,
      uptime: 0,
    },
    8: {
      start: 0,
      uptime: 0,
    },
    9: {
      start: 0,
      uptime: 0,
    },
    10: {
      start: 0,
      uptime: 0,
    },
  };

  critPerStack = 0;
  currentStacks = 0;
  buffIsUp = false;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.EYE_OF_COMMAND.id);
    if (this.active) {
      const itemDetails = this.combatants.selected.getItem(ITEMS.EYE_OF_COMMAND.id);
      this.critPerStack = calculateSecondaryStatDefault(865, 151, itemDetails.itemLevel);
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LEGIONS_GAZE.id) {
      return;
    }
    this.currentStacks = 1;
    this[spellId][this.currentStacks].start = event.timestamp;
    this.buffIsUp = true;
  }
  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LEGIONS_GAZE.id) {
      return;
    }
    this[spellId][this.currentStacks].uptime += event.timestamp - this[spellId][this.currentStacks].start;
    this.currentStacks = event.stack;
    this[spellId][this.currentStacks].start = event.timestamp;

  }
  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LEGIONS_GAZE.id) {
      return;
    }
    this[spellId][this.currentStacks].uptime += event.timestamp - this[spellId][this.currentStacks].start;
    this.currentStacks = 0;
    this.buffIsUp = false;
  }

  on_finished() {
    if (this.buffIsUp === true) {
      this[SPELLS.LEGIONS_GAZE.id][this.currentStacks].uptime += this.owner.fight.end_time - this[SPELLS.LEGIONS_GAZE.id][this.currentStacks].start;
    }
  }

  get averageCritGain() {
    let averageCritGain = 0;
    const spellId = SPELLS.LEGIONS_GAZE.id;
    for (let i = 0; i < 10; i++) {
      const stacks = i + 1;
      const uptime = this[spellId][stacks].uptime / this.owner.fightDuration;
      const increasedCrit = stacks * this.critPerStack;
      averageCritGain += increasedCrit * uptime;
    }
    return averageCritGain;
  }
  get totalBuffUptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.LEGIONS_GAZE.id) / this.owner.fightDuration;
  }
  get maxStackUptime() {
    return this[SPELLS.LEGIONS_GAZE.id][10].uptime / this.owner.fightDuration;
  }

  item() {
    return {
      item: ITEMS.EYE_OF_COMMAND,
      result: (
        <dfn data-tip={`Your overall uptime was ${formatPercentage(this.totalBuffUptime)}%.`}>
          {formatPercentage(this.maxStackUptime)}% uptime at 10 stacks <br />
          {this.averageCritGain.toFixed(0)} average crit
        </dfn>
      ),
    };
  }

}

export default EyeOfCommand;
