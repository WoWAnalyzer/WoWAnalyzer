
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

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
      str: combtants.selected.strength,
      agi: combtants.selected.agility,
      int: combtants.selected.intellect,
      crit: combtants.selected.critRating,
      haste: combtants.selected.hasteRating,
      mastery: combtants.selected.masteryRating,
      vers: combtants.selected.versatilityRating,
    }
  }

  get currentStrength() {
    return _stats.str;
  }

  get currentAgility() {
    return _stats.agi;
  }

  get currentIntellect() {
    return _stats.int;
  }

  get currentCrit() {
    return _stats.crit;
  }

  get currentHaste() {
    return _stats.haste;
  }

  get currentMastery() {
    return _stats.mastery;
  }

  get currentVers() {
    return _stats.vers;
  }



  on_toPlayer_applybuff(event) {
    _applyBuff(event);
  }

  on_toPlayer_removebuff(event) {
    _removeBuff(event);
  }

  on_toPlayer_changebuffstack(event) {
    _changeBuffStack(event);
  }

  on_toPlayer_applydebuff(event) {
    _applyBuff(event);
  }

  on_toPlayer_removedebuff(event) {
    _removeBuff(event);
  }

  on_toPlayer_changedebuffstack(event) {
    _changeBuffStack(event);
  }

  _applyBuff(event) {
    const statBuff = STAT_BUFFS[event.ability.guid];
    if(statBuff) {
      _changeStats(this._stats, statBuff, 1);
    }
  }

  _changeBuffStack(event) {
    const statBuff = STAT_BUFFS[event.ability.guid];
    if(statBuff) {
      _changeStats(this._stats, statBuff, event.newStacks - event.oldStacks);
    }
  }

  _removeBuff(event) {
    const statBuff = STAT_BUFFS[event.ability.guid];
    if(statBuff) {
      _changeStats(this._stats, statBuff, -1);
    }
  }

  _changeStats(orig, change, factor) {
    orig.str += _getBuffValue(change, change.str) * factor;
    orig.agi += _getBuffValue(change, change.agi) * factor;
    orig.int += _getBuffValue(change, change.int) * factor;
    orig.crit += _getBuffValue(change, change.crit) * factor;
    orig.haste += _getBuffValue(change, change.haste) * factor;
    orig.mastery += _getBuffValue(change, change.mastery) * factor;
    orig.vers += _getBuffValue(change, change.vers) * factor;
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

}

export default DamageTracker;
