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
    [2825]: 0.3, // Bloodlust
    [32182]: 0.3, // Heroism
    [80353]: 0.3, // Time Warp
    [90355]: 0.3, // Ancient Hysteria (Hunter pet BL)
    [160452]: 0.3, // Netherwinds (Hunter pet BL)
    [178207]: 0.25, // Drums of Fury
    [230935]: 0.25, // Drums of the Mountain
    [146555]: 0.25, // Drums of Rage
    [SPELLS.HOLY_AVENGER_TALENT.id]: 0.3,
    [SPELLS.BERSERKING.id]: 0.15,
    [202842]: 0.1, // Rapid Innervation (Balance Druid trait increasing Haste from Innervate)
    [SPELLS.POWER_INFUSION_TALENT.id]: 0.25,
    [240673]: 800 / 37500, // Shadow Priest artifact trait that shared with 4 allies: http://www.wowhead.com/spell=240673/mind-quickening
    [SPELLS.WARLOCK_AFFLI_T20_4P_BUFF.id]: 0.15,
    // Boss abilities:
    [209166]: 0.3, // DEBUFF - Fast Time from Elisande
    [209165]: -0.3, // DEBUFF - Slow Time from Elisande
    // [208944]: -Infinity, // DEBUFF - Time Stop from Elisande
  };

  eventLog = [];

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
    this.eventLog.push(cast);
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
    if (!this._currentlyCasting) {
      this.eventLog.push(logEntry);
    }

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

  on_finished() {
    const fightDuration = this.owner.fight.end_time - this.owner.fight.start_time;
    debug && console.log('totalTimeWasted:', this.totalTimeWasted, 'totalTime:', fightDuration, (this.totalTimeWasted / fightDuration));
    debug && console.log('totalHealingTimeWasted:', this.totalHealingTimeWasted, 'totalTime:', fightDuration, (this.totalHealingTimeWasted / fightDuration));

    const selectedCombatant = this.owner.selectedCombatant;

    this.totalTimeWasted = 0;
    this.totalHealingTimeWasted = 0;

    this.lastCastFinishedTimestamp = null;
    this.lastHealingCastFinishedTimestamp = null;

    this.eventLog.forEach((logEntry) => {
      this.currentHaste = this.baseHaste;
      Object.keys(this.constructor.HASTE_BUFFS).forEach((spellId) => {
        if (selectedCombatant.hasBuff(spellId, (logEntry.begincast || logEntry.cast).timestamp)) {
          this.applyHasteGain(this.constructor.HASTE_BUFFS[spellId]);
        }
      });

      this.processCast(logEntry);
    });

    debug && console.log('totalTimeWasted:', this.totalTimeWasted, 'totalTime:', fightDuration, (this.totalTimeWasted / fightDuration));
    debug && console.log('totalHealingTimeWasted:', this.totalHealingTimeWasted, 'totalTime:', fightDuration, (this.totalHealingTimeWasted / fightDuration));
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
