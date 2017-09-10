import SPELLS from 'common/SPELLS';
import { calculateSecondaryStatDefault } from 'common/stats';

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

  // Not yet implemented, for now this is just the general idea. This approach could also be used for merging HASTE_BUFFS and STACKABLE_HASTE_BUFFS.
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

    [SPELLS.LUNAR_INFUSION.id]: {
      // TODO: Is this buff included in the combatant Haste or like DMD:Hellfire not and then applied when you enter combat??? Having this here likely includes it in Haste twice.
      itemId: ITEMS.CHALICE_OF_MOONLIGHT.id,
      haste: (_, item) => calculateSecondaryStatDefault(900, 3619, item.itemLevel) / this.HASTE_RATING_PER_PERCENT,
    },
    [SPELLS.RISING_TIDES.id]: {
      itemId: ITEMS.CHARM_OF_THE_RISING_TIDE.id,
      hastePerStack: (_, item) => calculateSecondaryStatDefault(900, 576, item.itemLevel) / this.HASTE_RATING_PER_PERCENT,
    },
  };

  static BASE_GCD = 1500;
  static MINIMUM_GCD = 750;

  totalTimeWasted = 0;
  totalHealingTimeWasted = 0;

  lastCastFinishedTimestamp = null;
  lastHealingCastFinishedTimestamp = null;

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
  recordCastTime(
    castStartTimestamp,
    globalCooldown,
    begincast,
    cast,
    spellId
  ) {
    const timeWasted = castStartTimestamp - (this.lastCastFinishedTimestamp || this.owner.fight.start_time);
    this.totalTimeWasted += timeWasted;

    debug && console.log(`ABC: tot.:${Math.floor(this.totalTimeWasted)}\tthis:${Math.floor(timeWasted)}\t%c${cast.ability.name} (${spellId}): ${begincast ? 'channeled' : 'instant'}\t%cgcd:${Math.floor(globalCooldown)}\t%ccasttime:${cast.timestamp - castStartTimestamp}\tfighttime:${castStartTimestamp - this.owner.fight.start_time}`, 'color:red', 'color:green', 'color:black');

    this.lastCastFinishedTimestamp = Math.max(castStartTimestamp + globalCooldown, cast.timestamp);
  }
  baseHaste = null;
  currentHaste = null;
  on_initialized() {
    const combatant = this.combatants.selected;
    this.baseHaste = combatant.hastePercentage;
    this.currentHaste = this.baseHaste;

    debug && console.log(`ABC: Current haste: ${this.currentHaste}`);
  }
  // TODO: Determine whether buffs in combatants are already included in Haste. This may be the case for actual Haste buffs, but what about Spell Haste like the Whispers trinket?

  // region Event listeners
  // Buffs
  on_toPlayer_applybuff(event) {
    this._applyActiveBuff(event);
  }
  on_toPlayer_applybuffstack(event) {
    this._applyBuffStack(event);
  }
  on_toPlayer_removebuffstack(event) {
    this._removeBuffStack(event);
  }
  on_toPlayer_removebuff(event) {
    this._removeActiveBuff(event);
  }
  // Debuffs
  on_toPlayer_applydebuff(event) {
    this._applyActiveBuff(event);
  }
  on_toPlayer_applydebuffstack(event) {
    this._applyBuffStack(event);
  }
  on_toPlayer_removedebuffstack(event) {
    this._removeBuffStack(event);
  }
  on_toPlayer_removedebuff(event) {
    this._removeActiveBuff(event);
  }
  // endregion

  _applyActiveBuff(event) {
    const spellId = event.ability.guid;
    const hasteGain = this._getBaseHasteGain(spellId);

    if (hasteGain) {
      this.applyHasteGain(hasteGain);

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (gained ${hasteGain} from ${spellId})`);
    }
  }
  _applyBuffStack(event) {
    const spellId = event.ability.guid;
    const haste = this._getHastePerStackGain(spellId);

    // TODO: Track amount of current stacks so we can diff the amount of stacks gained
    // TODO: Haste from buff stacks is most likely additive; 3% + 3% = 6%, so if we already added 3% we should get base by reducing current Haste by 3% then add 6% instead
    // TODO: Actually this still needs to take the `.stack` property into account; 6 stacks = multiply haste by 6, but first reduce by already applied Haste in whatever previous event. This requires tracking buff stacks at which point we're kinda replicating the buff behavior of the Entity class, maybe we should look into changing that so we can use the existing buff tracking mechanisms?

    if (haste) {
      this.applyHasteGain(haste);

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (gained ${haste} from ${spellId})`);
    }
  }
  _removeBuffStack(event) {
    const spellId = event.ability.guid;
    const haste = this._getHastePerStackGain(spellId);

    if (haste) {
      this.applyHasteLoss(haste);

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (lost ${haste} from ${spellId})`);
    }
  }
  _removeActiveBuff(event) {
    const spellId = event.ability.guid;
    const haste = this._getBaseHasteGain(spellId);

    if (haste) {
      this.applyHasteLoss(haste);

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (lost ${haste} from ${spellId})`);
    }
  }

  applyHasteGain(haste) {
    this.currentHaste = this.constructor.addHaste(this.currentHaste, haste);
  }
  applyHasteLoss(haste) {
    this.currentHaste = this.constructor.removeHaste(this.currentHaste, haste);
  }

  getCurrentGlobalCooldown(spellId = null) {
    return (spellId && this.constructor.STATIC_GCD_ABILITIES[spellId]) || this.constructor.calculateGlobalCooldown(this.currentHaste);
  }
  /**
   * Gets the base Haste gain for the provided spell. If `hastePerStack` is setup this includes its value for the first stack.
   */
  _getBaseHasteGain(spellId) {
    const hasteBuff = this.constructor.HASTE_BUFFS[spellId] || undefined;

    let hasteGain = 0;
    if (typeof hasteBuff === 'number') {
      // A regular number is a static Haste percentage
      hasteGain = hasteBuff;
    } else if (typeof hasteBuff === 'object') {
      // An object can provide more info
      if (hasteBuff.haste) {
        hasteGain = this._getHasteValue(hasteBuff.haste, hasteBuff);
      }
      if (hasteBuff.hastePerStack) {
        hasteGain += this._getHasteValue(hasteBuff.hastePerStack, hasteBuff);
      }
    }
    return hasteGain;
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
}

export default AlwaysBeCasting;
