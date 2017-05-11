import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const HEALING_ABILITIES_ON_GCD = [
  SPELLS.FLASH_OF_LIGHT.id,
  SPELLS.HOLY_LIGHT.id,
  SPELLS.HOLY_SHOCK_CAST.id,
  // ABILITIES.JUDGMENT_CAST.id, // Only with either JoL or Ilterendi
  SPELLS.LIGHT_OF_DAWN_CAST.id,
  SPELLS.LIGHT_OF_THE_MARTYR.id,
  SPELLS.BESTOW_FAITH_TALENT.id,
  SPELLS.TYRS_DELIVERANCE_CAST.id,
  SPELLS.HOLY_PRISM_CAST.id,
  SPELLS.LIGHTS_HAMMER_TALENT.id,
  // ABILITIES.CRUSADER_STRIKE.id, // Only with Crusader's Might, is added in on_byPlayer_combatantinfo if applicable
];
const ABILITIES_ON_GCD = [
  ...HEALING_ABILITIES_ON_GCD,
  SPELLS.JUDGMENT_CAST.id,
  SPELLS.CRUSADER_STRIKE.id,
  225141, // http://www.wowhead.com/spell=225141/fel-crazed-rage (Draught of Souls)
  190784, // Divine Steed
  26573, // Consecration
  115750, // Blinding Light
  642, // Divine Shield
  633, // Lay on Hands
  SPELLS.BEACON_OF_FAITH_TALENT.id,
  SPELLS.BEACON_OF_THE_LIGHTBRINGER_TALENT.id, // pretty sure this will be the logged cast when BotLB is reapplied, not the below "Beacon of Light" which is the buff. Not yet tested so leaving both in.
  53563, // Beacon of Light
  SPELLS.BEACON_OF_VIRTUE_TALENT.id,
  1044, // Blessing of Freedom
  1022, // Blessing of Protection
  4987, // Cleanse
  853, // Hammer of Justice
  62124, // Hand of Reckoning
];


/* eslint-disable no-useless-computed-key */
/**
 * This includes debuffs
 */
const HASTE_BUFFS = {
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

  // Boss abilities:
  [209166]: 0.3, // DEBUFF - Fast Time from Elisande
  [209165]: -0.3, // DEBUFF - Slow Time from Elisande
  // [208944]: -Infinity, // DEBUFF - Time Stop from Elisande
};

const debug = false;

class AlwaysBeCasting extends Module {
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
    const isOnGcd = ABILITIES_ON_GCD.indexOf(spellId) !== -1;
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
    const isOnGcd = ABILITIES_ON_GCD.indexOf(spellId) !== -1;
    let countsAsHealingAbility = HEALING_ABILITIES_ON_GCD.indexOf(spellId) !== -1;

    if (!isOnGcd) {
      debug && console.log(`%cABC: ${cast.ability.name} (${spellId}) ignored`, 'color: gray');
      return;
    }
    if (countsAsHealingAbility && spellId === SPELLS.HOLY_SHOCK_CAST.id && !cast.targetIsFriendly) {
      debug && console.log(`%cABC: ${cast.ability.name} (${spellId}) skipped for healing time; target is not friendly`, 'color: orange');
      countsAsHealingAbility = false;
    }

    const castStartTimestamp = (begincast ? begincast : cast).timestamp;
    const timeWasted = castStartTimestamp - (this.lastCastFinishedTimestamp || this.owner.fight.start_time);
    this.totalTimeWasted += timeWasted;

    if (countsAsHealingAbility) {
      const healTimeWasted = castStartTimestamp - (this.lastHealingCastFinishedTimestamp || this.owner.fight.start_time);
      this.totalHealingTimeWasted += healTimeWasted;
    }

    const gcd = this.constructor.calculateGlobalCooldown(this.currentHaste) * 1000;

    debug && console.log(`ABC: tot.:${Math.floor(this.totalTimeWasted)}\tthis:${Math.floor(timeWasted)}\t%c${cast.ability.name} (${spellId}): ${begincast ? 'channeled' : 'instant'}\t%cgcd:${Math.floor(gcd)}\t%ccasttime:${cast.timestamp - castStartTimestamp}\tfighttime:${castStartTimestamp - this.owner.fight.start_time}`, 'color:red', 'color:green', 'color:black');
    this.verifyCast({ begincast, cast }, gcd);

    this.lastCastFinishedTimestamp = Math.max(castStartTimestamp + gcd, cast.timestamp);
    if (countsAsHealingAbility) {
      this.lastHealingCastFinishedTimestamp = Math.max(castStartTimestamp + gcd, cast.timestamp);
    }
  }
  verifyCast({ begincast, cast }, gcd) {
    if (cast.ability.guid !== SPELLS.FLASH_OF_LIGHT.id) {
      return;
    }
    const castTime = cast.timestamp - begincast.timestamp;
    if (!this.constructor.inRange(castTime, gcd, 50)) { // cast times seem to fluctuate by 50ms, not sure if it depends on player latency, in that case it could be a lot more flexible
      console.warn(`Expected Flash of Light cast time (${castTime}) to match GCD (${Math.round(gcd)}) @${cast.timestamp - this.owner.fight.start_time}`);
    }
  }
  static inRange(num1, goal, buffer) {
    return num1 > (goal - buffer) && num1 < (goal + buffer);
  }
  baseHaste = null;
  currentHaste = null;
  on_byPlayer_combatantinfo() {
    const combatant = this.owner.modules.combatants.selected;
    this.baseHaste = combatant.hastePercentage;
    this.currentHaste = this.baseHaste;

    debug && console.log(`ABC: Current haste: ${this.currentHaste}`);

    if (combatant.lv15Talent === SPELLS.CRUSADERS_MIGHT_TALENT.id) {
      HEALING_ABILITIES_ON_GCD.push(SPELLS.CRUSADER_STRIKE.id);
    }
    if (combatant.lv90Talent === SPELLS.JUDGMENT_OF_LIGHT_TALENT.id) {
      HEALING_ABILITIES_ON_GCD.push(SPELLS.JUDGMENT_CAST.id);
    }
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
    const hasteGain = HASTE_BUFFS[spellId];
    if (hasteGain) {
      this.applyHasteGain(hasteGain);

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (gained ${hasteGain} from ${spellId})`);
    }
  }
  removeActiveBuff(event) {
    const spellId = event.ability.guid;
    const hasteGain = HASTE_BUFFS[spellId];
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
      Object.keys(HASTE_BUFFS).forEach((spellId) => {
        if (selectedCombatant.hasBuff(spellId, (logEntry.begincast || logEntry.cast).timestamp)) {
          this.applyHasteGain(HASTE_BUFFS[spellId]);
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
