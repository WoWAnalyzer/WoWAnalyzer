import SPELLS from 'common/SPELLS';
import { calculateSecondaryStatDefault } from 'common/stats';
import { formatDuration } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import ITEMS from '../../../common/ITEMS';

const debug = false;

class AlwaysBeCasting extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  // TODO: Should all this props be lower case?
  static ABILITIES_ON_GCD = [
    // Extend this class and override this property in your spec class to implement this module.
  ];
  static STATIC_GCD_ABILITIES = {
    //Abilities which GCD is not affected by haste.
    //[spellId] : [gcd value in seconds]
  };

  // It would be nice to have this point to a value in the Combatant class, but that would be tricky since this is `static`.
  static HASTE_RATING_PER_PERCENT = 37500;
  // TODO: Maybe extract "time" changing abilities since they also scale the minimum GCD cap? Probably better to dive into the tooltips to find out how the stat that does that is actually called. Spell Haste, Casting Speed, Attack Speed, Haste, ... are all different variants that look like Haste but act different.
  // TODO: Support time freeze kinda effects, like Elisande's Time Stop or unavoidable stuns?
  /* eslint-disable no-useless-computed-key */
  static HASTE_BUFFS = {
    [SPELLS.BLOODLUST.id]: 0.3,
    [SPELLS.HEROISM.id]: 0.3,
    [SPELLS.TIME_WARP.id]: 0.3,
    [SPELLS.ANCIENT_HYSTERIA.id]: 0.3, // Hunter pet BL
    [SPELLS.NETHERWINDS.id]: 0.3, // Hunter pet BL
    [SPELLS.DRUMS_OF_FURY.id]: 0.25,
    [SPELLS.DRUMS_OF_THE_MOUNTAIN.id]: 0.25,
    [SPELLS.DRUMS_OF_RAGE.id]: 0.25,
    [SPELLS.HOLY_AVENGER_TALENT.id]: 0.3,
    [SPELLS.BERSERKING.id]: 0.15,
    [202842]: 0.1, // Rapid Innervation (Balance Druid trait increasing Haste from Innervate)
    [SPELLS.POWER_INFUSION_TALENT.id]: 0.25,
    [240673]: 800 / 37500, // Shadow Priest artifact trait that's shared with 4 allies: http://www.wowhead.com/spell=240673/mind-quickening
    [SPELLS.WARLOCK_AFFLI_T20_4P_BUFF.id]: 0.15,
    [SPELLS.TRUESHOT.id]: 0.4, // MM Hunter main CD

    // Boss abilities:
    [209166]: 0.3, // DEBUFF - Fast Time from Elisande
    [209165]: -0.3, // DEBUFF - Slow Time from Elisande
    // [208944]: -Infinity, // DEBUFF - Time Stop from Elisande
    [SPELLS.BONE_SHIELD.id]: 0.1, //Blood BK haste buff from maintaining boneshield

    [SPELLS.RISING_TIDES.id]: {
      itemId: ITEMS.CHARM_OF_THE_RISING_TIDE.id,
      hastePerStack: (_, item) => calculateSecondaryStatDefault(900, 576, item.itemLevel) / this.HASTE_RATING_PER_PERCENT,
    },
  };
  // TODO: Add channels array to fix issues where is channel started pre-combat it doesn't register the `begincast` and considers the finish a GCD adding downtime. This can also be used to automatically add the channelVerifiers.

  static BASE_GCD = 1500;
  static MINIMUM_GCD = 750;

  /**
   * The amount of milliseconds not spent casting anything or waiting for the GCD.
   * @type {number}
   */
  totalTimeWasted = 0;

  currentHaste = null;
  on_initialized() {
    const combatant = this.combatants.selected;
    this.currentHaste = combatant.hastePercentage;

    if (this.combatants.selected.hasFinger(ITEMS.SEPHUZS_SECRET.id)) {
      // Sephuz Secret provides a 2% Haste gain on top of its secondary stats
      this._applyHasteGain(0.02);
    }

    // TODO: Determine whether buffs in combatants are already included in Haste. This may be the case for actual Haste buffs, but what about Spell Haste like the Whispers trinket?

    debug && console.log(`ABC: Starting haste: ${this.currentHaste}`);
  }

  _currentlyCasting = null;
  on_byPlayer_begincast(event) {
    const cast = {
      begincast: event,
      cast: null,
    };

    this._currentlyCasting = cast;
  }
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const isOnGcd = this.constructor.ABILITIES_ON_GCD.indexOf(spellId) !== -1;
    // This fixes a crash when boss abilities are registered as casts which could even happen while channeling. For example on Trilliax: http://i.imgur.com/7QAFy1q.png
    if (!isOnGcd) {
      return;
    }

    if (this._currentlyCasting && this._currentlyCasting.begincast.ability.guid !== event.ability.guid) {
      // This is a different spell then registered in `begincast`, previous cast was interrupted
      this._currentlyCasting = null;
    }

    const logEntry = this._currentlyCasting || {
      begincast: null,
    };
    logEntry.cast = event;

    this.processCast(logEntry);
    this._currentlyCasting = null;
  }

  processCast({ begincast, cast }) {
    if (!cast) {
      return;
    }
    const spellId = cast.ability.guid;
    const isOnGcd = this.constructor.ABILITIES_ON_GCD.indexOf(spellId) !== -1;
    //const isFullGcd = this.constructor.FULLGCD_ABILITIES.indexOf(spellId) !== -1;

    if (!isOnGcd) {
      debug && console.log(`%cABC: ${cast.ability.name} (${spellId}) ignored`, 'color: gray');
      return;
    }

    const globalCooldown = this.getCurrentGlobalCooldown(spellId);

    // TODO: Change this to begincast || cast
    const castStartTimestamp = (begincast ? begincast : cast).timestamp;

    this.recordCastTime(
      castStartTimestamp,
      globalCooldown,
      begincast,
      cast,
      spellId
    );
  }
  _lastCastFinishedTimestamp = null;
  recordCastTime(
    castStartTimestamp,
    globalCooldown,
    begincast,
    cast,
    spellId
  ) {
    const timeWasted = castStartTimestamp - (this._lastCastFinishedTimestamp || this.owner.fight.start_time);
    this.totalTimeWasted += timeWasted;

    debug && console.log(`ABC: tot.:${Math.floor(this.totalTimeWasted)}\tthis:${Math.floor(timeWasted)}\t%c${cast.ability.name} (${spellId}): ${begincast ? 'channeled' : 'instant'}\t%cgcd:${Math.floor(globalCooldown)}\t%ccasttime:${cast.timestamp - castStartTimestamp}\tfighttime:${formatDuration((castStartTimestamp - this.owner.fight.start_time) / 1000)}`, 'color:red', 'color:green', 'color:black');

    this._lastCastFinishedTimestamp = Math.max(castStartTimestamp + globalCooldown, cast.timestamp);
  }
  on_finished() {
    const timeWasted = this.owner.fight.end_time - (this._lastCastFinishedTimestamp || this.owner.fight.start_time);
    this.totalTimeWasted += timeWasted;
  }

  // region Event listeners
  // Buffs
  on_toPlayer_applybuff(event) {
    this._applyActiveBuff(event.ability.guid);
  }
  on_toPlayer_changebuffstack(event) {
    this._changeBuffStack(event);
  }
  on_toPlayer_removebuff(event) {
    this._removeActiveBuff(event);
  }
  // Debuffs
  on_toPlayer_applydebuff(event) {
    this._applyActiveBuff(event.ability.guid);
  }
  on_toPlayer_changedebuffstack(event) {
    this._changeBuffStack(event);
  }
  on_toPlayer_removedebuff(event) {
    this._removeActiveBuff(event);
  }
  // endregion

  getCurrentGlobalCooldown(spellId = null) {
    return (spellId && this.constructor.STATIC_GCD_ABILITIES[spellId]) || this.constructor.calculateGlobalCooldown(this.currentHaste);
  }

  _applyActiveBuff(spellId) {
    const hasteGain = this._getBaseHasteGain(spellId);

    if (hasteGain) {
      this._applyHasteGain(hasteGain);

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (gained ${hasteGain} from ${SPELLS[spellId] ? SPELLS[spellId].name : spellId})`);
    }
  }
  _removeActiveBuff(event) {
    const spellId = event.ability.guid;
    const haste = this._getBaseHasteGain(spellId);

    if (haste) {
      this._applyHasteLoss(haste);

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (lost ${haste} from ${SPELLS[spellId] ? SPELLS[spellId].name : spellId})`);
    }
  }
  /**
   * Gets the base Haste gain for the provided spell.
   */
  _getBaseHasteGain(spellId) {
    const hasteBuff = this.constructor.HASTE_BUFFS[spellId] || undefined;

    if (typeof hasteBuff === 'number') {
      // A regular number is a static Haste percentage
      return hasteBuff;
    } else if (typeof hasteBuff === 'object') {
      // An object can provide more info
      if (hasteBuff.haste) {
        return this._getHasteValue(hasteBuff.haste, hasteBuff);
      }
    }
    return null;
  }

  _changeBuffStack(event) {
    const spellId = event.ability.guid;
    const haste = this._getHastePerStackGain(spellId);

    if (haste) {
      // Haste stacks are usually additive, so at 5 stacks with 3% per you'd be at 15%, 6 stacks = 18%. This means the only right way to add a Haste stack is to reset to Haste without the old total and then add the new total Haste again.
      this._applyHasteLoss(haste * event.oldStacks);
      this._applyHasteGain(haste * event.newStacks);

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (gained ${haste * event.stacksGained} from ${SPELLS[spellId] ? SPELLS[spellId].name : spellId})`);
    }
  }
  _getHastePerStackGain(spellId) {
    const hasteBuff = this.constructor.HASTE_BUFFS[spellId] || undefined;

    if (typeof hasteBuff === 'number') {
      // hasteBuff being a number is shorthand for static haste only
    } else if (typeof hasteBuff === 'object') {
      if (hasteBuff.hastePerStack) {
        return this._getHasteValue(hasteBuff.hastePerStack, hasteBuff);
      }
    }
    return null;
  }

  _applyHasteGain(haste) {
    this.currentHaste = this.constructor.addHaste(this.currentHaste, haste);
  }
  _applyHasteLoss(haste) {
    this.currentHaste = this.constructor.removeHaste(this.currentHaste, haste);
  }

  /**
   * Get the actual Haste value from a prop allowing various formats.
   */
  _getHasteValue(value, hasteBuff) {
    const { itemId } = hasteBuff;
    if (typeof value === 'function') {
      const selectedCombatant = this.combatants.selected;
      let itemDetails;
      if (itemId) {
        itemDetails = selectedCombatant.getItem(itemId);
        if (!itemDetails) {
          console.error('Failed to retrieve item information for item with ID:', itemId);
        }
      }
      return value(selectedCombatant, itemDetails);
    } else {
      return value;
    }
  }

  /**
   * Can be used to determine the accuracy of the Haste tracking. This does not work properly on abilities that can get reduced channel times from other effects such as talents or traits.
   */
  _verifyChannel(spellId, defaultCastTime, begincast, cast) {
    if (cast.ability.guid === spellId) {
      if (!begincast) {
        console.error('Missing begin cast for channeled ability:', cast);
        return;
      }

      const actualCastTime = cast.timestamp - begincast.timestamp;
      const expectedCastTime = Math.round(defaultCastTime / (1 + this.currentHaste));
      if (!this.constructor.inRange(actualCastTime, expectedCastTime, 50)) { // cast times seem to fluctuate by 50ms, not sure if it depends on player latency, in that case it could be a lot more flexible
        console.warn(`ABC: ${SPELLS[spellId].name} channel: Expected actual ${actualCastTime}ms to be expected ${expectedCastTime}ms ± 50ms @ ${formatDuration((cast.timestamp - this.owner.fight.start_time) / 1000)}`, this.combatants.selected.activeBuffs());
      }
    }
  }

  static calculateGlobalCooldown(haste) {
    const gcd = this.BASE_GCD / (1 + haste);
    // Global cooldowns can't normally drop below a certain threshold
    return Math.max(this.MINIMUM_GCD, gcd);
  }
  static addHaste(baseHaste, hasteGain) {
    return baseHaste * (1 + hasteGain) + hasteGain;
  }
  static removeHaste(baseHaste, hasteLoss) {
    return (baseHaste - hasteLoss) / (1 + hasteLoss);
  }
  static inRange(num1, goal, buffer) {
    return num1 > (goal - buffer) && num1 < (goal + buffer);
  }
}

export default AlwaysBeCasting;
