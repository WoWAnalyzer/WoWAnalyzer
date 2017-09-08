import SPELLS from 'common/SPELLS';
import { calculateSecondaryStatDefault } from 'common/stats';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

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

  /* eslint-disable no-useless-computed-key */
  static HASTE_BUFFS = { // This includes debuffs
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
    [240673]: 800 / 37500, // Shadow Priest artifact trait that shared with 4 allies: http://www.wowhead.com/spell=240673/mind-quickening
    [SPELLS.WARLOCK_AFFLI_T20_4P_BUFF.id]: 0.15,
    [SPELLS.TRUESHOT.id]: 0.4, //MM Hunter main CD
    [242543]: 3619 / 37500, // Chalice of Moonlight Haste buff (900 item level since we can't scale with item level yet)

    // Boss abilities:
    [209166]: 0.3, // DEBUFF - Fast Time from Elisande
    [209165]: -0.3, // DEBUFF - Slow Time from Elisande
    // [208944]: -Infinity, // DEBUFF - Time Stop from Elisande
    [SPELLS.BONE_SHIELD.id]: 0.1, //Blood BK haste buff from maintaining boneshield
  };
  // TODO: Maybe extract "time" changing abilities since they also scale the minimum GCD cap? Probably better to dive into the tooltips to find out how the stat that does that is actually called. Spell Haste, Casting Speed, Attack Speed, Haste, ... are all different variants that look like Haste but act different.
  // TODO: Support time freeze kinda effects, like Elisande's Time Stop or unavoidable stuns?
  
  static STACKABLE_HASTE_BUFFS = {    
    //Stackable haste buffs - Set Haste per stack and MaxStacks (0 for no max) - See example in Balance Druid ABC
    //[id] : {
    //  Haste: (combatant) => (),
    //  CurrentStacks: 0,
    //  MaxStacks: 0,
    //},
  };

  // Not yet implemented, for now this is just the general idea. This approach could also be used for merging HASTE_BUFFS and STACKABLE_HASTE_BUFFS.
  // TODO: Extract 37500, this might also be different for some specs
  static ITEMS = {
    // Chalice of Moonlight
    // TODO: Is this buff included in the combatant Haste or like DMD:Hellfire not and then applied when you enter combat??? Having this here likely includes it in Haste twice.
    [242543]: item => calculateSecondaryStatDefault(855, 305, item.itemLevel) / 37500,
    // Charm of the Rising Tide (Rising Tides buff)
    [242458]: item => ({
      hastePerTick: calculateSecondaryStatDefault(900, 576, item.itemLevel) / 37500,
    }),
  };

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
  on_toPlayer_applybuff(event) {
    this.applyActiveBuff(event);
  }
  on_toPlayer_applybuffstack(event){
    this.applyBuffStack(event);
  }
  on_toPlayer_removebuff(event) {
    this.removeActiveBuff(event);
  }
  on_toPlayer_applydebuff(event) {
    this.applyActiveBuff(event);
  }
  on_toPlayer_removedebuff(event) {
    this.removeActiveBuff(event);
  }
  applyActiveBuff(event) {
    const spellId = event.ability.guid;
    let hasteGain = this.constructor.HASTE_BUFFS[spellId] || undefined;
    
    if (this.constructor.STACKABLE_HASTE_BUFFS[spellId]){
      hasteGain = this.constructor.STACKABLE_HASTE_BUFFS[spellId].Haste(this.combatants.selected);
      this.constructor.STACKABLE_HASTE_BUFFS[spellId].CurrentStacks += 1;
    }

    if (hasteGain) {
      this.applyHasteGain(hasteGain);

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (gained ${hasteGain} from ${spellId})`);
    }
  }
  applyBuffStack(event) {
    const spellId = event.ability.guid;
    const stackInfo = this.constructor.STACKABLE_HASTE_BUFFS[spellId];
    let hasteGain;

    if (stackInfo){
      hasteGain = stackInfo.Haste(this.combatants.selected);
    }

    if (hasteGain) {
      //Only add haste stack if max stacks not already reached
      if (stackInfo.MaxStacks === 0 || stackInfo.CurrentStacks < stackInfo.MaxStacks){
        this.applyHasteGain(hasteGain);
        stackInfo.CurrentStacks += 1;
      }

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (gained ${hasteGain} from ${spellId})`);
    }
  }
  removeActiveBuff(event) {
    const spellId = event.ability.guid;
    let hasteLoss = this.constructor.HASTE_BUFFS[spellId] || undefined;
    
    if (this.constructor.STACKABLE_HASTE_BUFFS[spellId]){
      //When buff loss, it should lose haste equal to base buff haste * number of stacks
      // TODO: If possible it would be nice to make this so it doesn't mutate the static property
      // TODO: change the properties of STACKABLE_HASTE_BUFFS to lower case
      hasteLoss = this.constructor.STACKABLE_HASTE_BUFFS[spellId].Haste(this.combatants.selected) * this.constructor.STACKABLE_HASTE_BUFFS[spellId].CurrentStacks;
      this.constructor.STACKABLE_HASTE_BUFFS[spellId].CurrentStacks = 0;
    }

    if (hasteLoss) {
      this.applyHasteLoss(hasteLoss);

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (lost ${hasteLoss} from ${spellId})`);
    }
  }

  static calculateGlobalCooldown(haste) {
    // TODO: Extract 1.5 to a static variable as the default is different in several specs
    // TODO: Change 1.5 to ms (1500) to be consistent across the class
    const gcd = 1.5 / (1 + haste);
    //Check the gcd doesnt go under the limit
    return gcd > 0.75 ? gcd : 0.75;
  }
  static applyHasteGain(baseHaste, hasteGain) {
    return baseHaste * (1 + hasteGain) + hasteGain;
  }
  applyHasteGain(hasteGain) {
    this.currentHaste = this.constructor.applyHasteGain(this.currentHaste, hasteGain);
  }
  static applyHasteLoss(baseHaste, hasteLoss) {
    return (baseHaste - hasteLoss) / (1 + hasteLoss);
  }
  applyHasteLoss(hasteGain) {
    this.currentHaste = this.constructor.applyHasteLoss(this.currentHaste, hasteGain);
  }

  getCurrentGlobalCooldown(spellId) {
    return this.constructor.STATIC_GCD_ABILITIES[spellId] || this.constructor.calculateGlobalCooldown(this.currentHaste) * 1000;
  }
}


export default AlwaysBeCasting;
