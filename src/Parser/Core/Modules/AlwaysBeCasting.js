import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

import Combatants from 'Parser/Core/Modules/Combatants';

const debug = false;

class AlwaysBeCasting extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  static ABILITIES_ON_GCD = [
    // Extend this class and override this property in your spec class to implement this module.
  ];
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
    [242543]: 3619 / 37500, // Chalice of Moonlight Haste buff (900 item level since we can't scale with item level yet)
    // Boss abilities:
    [209166]: 0.3, // DEBUFF - Fast Time from Elisande
    [209165]: -0.3, // DEBUFF - Slow Time from Elisande
    // [208944]: -Infinity, // DEBUFF - Time Stop from Elisande
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

    if (!isOnGcd) {
      debug && console.log(`%cABC: ${cast.ability.name} (${spellId}) ignored`, 'color: gray');
      return;
    }

    const globalCooldown = this.constructor.calculateGlobalCooldown(this.currentHaste) * 1000;

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
    //Iskalla: Inserted this so time wasted never goes negative, even if there's a haste buff not yet implemented
    //Because of this it doesnt reflect the real downtime, but its somewhat more accurate
    ///TODO Implement every haste buff at some point?, remove this
    const tWasted = castStartTimestamp - (this.lastCastFinishedTimestamp || this.owner.fight.start_time);
    const timeWasted = tWasted < 0 ? 0 : tWasted;
    //const timeWasted = castStartTimestamp - (this.lastCastFinishedTimestamp || this.owner.fight.start_time);
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
  on_toPlayer_applybuff(event) {
    this.applyActiveBuff(event);
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
    const hasteGain = this.constructor.HASTE_BUFFS[spellId];
    if (hasteGain) {
      this.applyHasteGain(hasteGain);

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (gained ${hasteGain} from ${spellId})`);
    }
  }
  removeActiveBuff(event) {
    const spellId = event.ability.guid;
    const hasteGain = this.constructor.HASTE_BUFFS[spellId];
    if (hasteGain) {
      this.applyHasteLoss(hasteGain);

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (lost ${hasteGain} from ${spellId})`);
    }
  }

  static calculateGlobalCooldown(haste) {
    return 1.5 / (1 + haste);
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
}


export default AlwaysBeCasting;
