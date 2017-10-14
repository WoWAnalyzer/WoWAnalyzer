import SPELLS from 'common/SPELLS';
import { formatMilliseconds } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = true;

class StatTracker extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  static STAT_BUFFS = {
    // Potions
    [SPELLS.POTION_OF_PROLONGED_POWER.id]: { str: 2500, agi: 2500, int: 2500 },
    // probably no need to add flasks/food because they never fall

    // Trinkets

    // Sets
    [SPELLS.JACINS_RUSE.id]: { mastery: 3000 },

    // Druid
    [SPELLS.ASTRAL_HARMONY.id]: { mastery: 4000 },


  }

  _stats = {};

  on_initialized() {
    this._stats = {
      str: this.combatants.selected.strength,
      agi: this.combatants.selected.agility,
      int: this.combatants.selected.intellect,
      crit: this.combatants.selected.critRating,
      haste: this.combatants.selected.hasteRating,
      mastery: this.combatants.selected.masteryRating,
      vers: this.combatants.selected.versatilityRating,
    };
    debug && this._debugPrintStats(this._stats);
  }

  get currentStrength() {
    return this._stats.str;
  }

  get currentAgility() {
    return this._stats.agi;
  }

  get currentIntellect() {
    return this._stats.int;
  }

  get currentCrit() {
    return this._stats.crit;
  }

  get currentHaste() {
    return this._stats.haste;
  }

  get currentMastery() {
    return this._stats.mastery;
  }

  get currentVers() {
    return this._stats.vers;
  }



  //on_toPlayer_applybuff(event) {
  //  this._applyBuff(event);
  //}

  // on_toPlayer_removebuff(event) {
  //   this._removeBuff(event);
  // }

  on_toPlayer_changebuffstack(event) {
    this._changeBuffStack(event);
  }

  // on_toPlayer_applydebuff(event) {
  //   this._applyBuff(event);
  // }

  // on_toPlayer_removedebuff(event) {
  //   this._removeBuff(event);
  // }

  on_toPlayer_changedebuffstack(event) {
    this._changeBuffStack(event);
  }

  // _applyBuff(event) {
  //   const spellId = event.ability.guid;
  //   const statBuff = this.constructor.STAT_BUFFS[spellId];
  //   if(statBuff) {
  //     debug && console.log(`StatTracker: applying ${SPELLS[spellId] ? SPELLS[spellId].name : spellId}`);
  //     this._changeStats(this._stats, statBuff, 1);
  //   }
  // }

  _changeBuffStack(event) {
    const spellId = event.ability.guid;
    const statBuff = this.constructor.STAT_BUFFS[spellId];
    if(statBuff) {
      // ignore prepull buff application, as they're already accounted for in combatantinfo
      // we have to check the stacks count because Entities incorrectly copies the prepull property onto changes and removal following the application
      if(event.oldStacks === 0 && event.prepull) {
        debug && console.log(`StatTracker prepull application IGNORED for ${SPELLS[spellId] ? SPELLS[spellId].name : spellId}`);
        return;
      }
      debug && console.log(`StatTracker: (${event.oldStacks} -> ${event.newStacks}) ${SPELLS[spellId] ? SPELLS[spellId].name : spellId}`);
      this._changeStats(this._stats, statBuff, event.newStacks - event.oldStacks);
    }
  }

  // _removeBuff(event) {
  //   const spellId = event.ability.guid;
  //   const statBuff = this.constructor.STAT_BUFFS[spellId];
  //   if(statBuff) {
  //     debug && console.log(`StatTracker: removing ${SPELLS[spellId] ? SPELLS[spellId].name : spellId}`);
  //     this._changeStats(this._stats, statBuff, -1);
  //   }
  // }

  _changeStats(orig, change, factor) {
    orig.str += this._getBuffValue(change, change.str) * factor;
    orig.agi += this._getBuffValue(change, change.agi) * factor;
    orig.int += this._getBuffValue(change, change.int) * factor;
    orig.crit += this._getBuffValue(change, change.crit) * factor;
    orig.haste += this._getBuffValue(change, change.haste) * factor;
    orig.mastery += this._getBuffValue(change, change.mastery) * factor;
    orig.vers += this._getBuffValue(change, change.vers) * factor;
    debug && this._debugPrintStats(orig);
  }

  /**
   * Gets the actual stat value in whatever format it is.
   * a number value will be returned as is
   * a function value will be called with (selectedCombatant, itemDetails) and the result returned
   * an undefined stat will default to 0.
   */
  _getBuffValue(buffObj, statVal) {
    if (statVal === undefined) {
      return 0;
    } else if (typeof statVal === 'function') {
      const selectedCombatant = this.combatants.selected;
      let itemDetails;
      if (buffObj.itemId) {
        itemDetails = this.combatants.selected.getItem(buffObj.itemId);
        if (!itemDetails) {
          console.error('Failed to retrieve item information for item with ID:', buffObj.itemId);
        }
      }
      return statVal(selectedCombatant, itemDetails);
    } else {
      return statVal;
    }
  }

  _debugPrintStats(stats) {
    console.log(`StatTracker:`, formatMilliseconds(this.owner.fightDuration),`STR=${stats.str} AGI=${stats.agi} INT=${stats.int} CRT=${stats.crit} HST=${stats.haste} MST=${stats.mastery} VRS=${stats.vers}`);
  }

}

export default StatTracker;
