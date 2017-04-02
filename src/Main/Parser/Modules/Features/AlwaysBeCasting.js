import Module from 'Main/Parser/Module';
import { FLASH_OF_LIGHT_SPELL_ID, HOLY_LIGHT_SPELL_ID, HOLY_SHOCK_CAST_SPELL_ID, JUDGMENT_CAST_SPELL_ID, LIGHT_OF_DAWN_CAST_SPELL_ID, LIGHT_OF_THE_MARTYR_SPELL_ID, BESTOW_FAITH_SPELL_ID, TYRS_DELIVERANCE_CAST_SPELL_ID, HOLY_PRISM_CAST_SPELL_ID, CRUSADER_STRIKE_SPELL_ID, LIGHTS_HAMMER_CAST_SPELL_ID } from 'Main/Parser/Constants';
import { TALENT_ROWS } from 'Main/Parser/Modules/Core/Combatant';

const HEALING_ABILITIES_ON_GCD = [
  FLASH_OF_LIGHT_SPELL_ID,
  HOLY_LIGHT_SPELL_ID,
  HOLY_SHOCK_CAST_SPELL_ID,
  JUDGMENT_CAST_SPELL_ID,
  LIGHT_OF_DAWN_CAST_SPELL_ID,
  LIGHT_OF_THE_MARTYR_SPELL_ID,
  BESTOW_FAITH_SPELL_ID,
  TYRS_DELIVERANCE_CAST_SPELL_ID,
  HOLY_PRISM_CAST_SPELL_ID,
  LIGHTS_HAMMER_CAST_SPELL_ID,
  // CRUSADER_STRIKE_SPELL_ID, // Only with Crusader's Might, is added in on_combatantinfo if applicable
];
const ABILITIES_ON_GCD = [
  ...HEALING_ABILITIES_ON_GCD,
  CRUSADER_STRIKE_SPELL_ID, // Only with Crusader's Might
  225141, // http://www.wowhead.com/spell=225141/fel-crazed-rage (Draught of Souls)
  190784, // Divine Steed
  26573, // Consecration
  115750, // Blinding Light
  642, // Divine Shield
  633, // Lay on Hands
  156910, // Beacon of Faith
  53563, // Beacon of Light
  200025, // Beacon of Virtue
  1044, // Blessing of Freedom
  1022, // Blessing of Protection
  4987, // Cleanse
  853, // Hammer of Justice
  62124, // Hand of Reckoning
];
const HASTE_BUFFS = {
  [2825]: 0.3, // Bloodlust
  [32182]: 0.3, // Heroism
  [80353]: 0.3, // Time Warp
  [90355]: 0.3, // Ancient Hysteria (Hunter pet BL)
  [160452]: 0.3, // Netherwinds (Hunter pet BL)
  [178207]: 0.25, // Drums of Fury
  [230935]: 0.25, // Drums of the Mountain
  [146555]: 0.25, // Drums of Rage
  [105809]: 0.3, // Holy Avenger
};
const CRUSADERS_MIGHT_SPELL_ID = 196926;

const debug = true;

class AlwaysBeCasting extends Module {
  // TODO: Pause on death

  // TODO: Fight start
  // TODO: Bloodlust haste
  // TODO: HA haste

  // I'm working on an AlwaysBeCasting module for the Holy Paladin Analyzer. One that can ignore non healing spells. Primary reason for this
  // is that my spreadsheet is only 90% or so accurate and I want something I trust. And it's a fun challenge.
  // So what I figured is that we need to track Haste. But logs don't show current Haste values I'm afraid. So we're going to need to take
  // the default haste value (it's shown when you start a boss fight) and assume that's the GCD. Then to make things more accurate we'll
  // want to adjust haste for things like Bloodlust, which should be pretty easy. And as this module grows we can make it recognize more
  // things. One downside though is that some groups pop Bloodlust before the pull. This makes it so the `applybuff` is never recorded in
  // the combatlog. But there would still be a `removebuff`. This sucks. But we can work with this by recording all the casts
  // and only after we finish processing the combatlog we go back through this log and combine it with the buffs log (where a buff with
  // only the `removebuff` event is recognized as being on since pull) to then get accurate haste values (= accurate GCD values) and find
  // the real dead GCD count and misused GCD count.

  castLog = [];

  totalTimeWasted = 0;
  totalHealingTimeWasted = 0;

  lastCastFinishedTimestamp = null;
  lastHealingCastFinishedTimestamp = null;

  _currentlyCasting = null;
  on_byPlayer_begincast(event) {
    const cast = {
      ability: event.ability,
      begincast: event,
      cast: null,
    };

    this._currentlyCasting = cast;
    this.castLog.push(cast);
  }
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const isOnGcd = ABILITIES_ON_GCD.indexOf(spellId) !== -1;
    let countsAsHealingAbility = HEALING_ABILITIES_ON_GCD.indexOf(spellId) !== -1;

    if (!isOnGcd) {
      debug && console.log(`%cABC: ${event.ability.name} (${spellId}) ignored`, 'color: gray');
      return;
    }
    if (countsAsHealingAbility && spellId === HOLY_SHOCK_CAST_SPELL_ID && !event.targetIsFriendly) {
      debug && console.log(`%cABC: ${event.ability.name} (${spellId}) skipped for healing time; target is not friendly`, 'color: orange');
      countsAsHealingAbility = false;
    }

    const log = this._currentlyCasting || {
      ability: event.ability,
      begincast: null,
    };
    log.cast = event;
    if (!this._currentlyCasting) {
      this.castLog.push(log);
    }

    // TODO: Filter out damaging HS by checking the target
    // TODO: Filter out CS when not CM

    const begincast = this._currentlyCasting ? this._currentlyCasting.begincast : event;
    const timestamp = begincast.timestamp;
    const timeWasted = timestamp - (this.lastCastFinishedTimestamp || this.owner.fight.start_time);
    this.totalTimeWasted += timeWasted;

    if (countsAsHealingAbility) {
      const healTimeWasted = timestamp - (this.lastHealingCastFinishedTimestamp || this.owner.fight.start_time);
      this.totalHealingTimeWasted += healTimeWasted;
    }

    const gcd = this.constructor.calculateGlobalCooldown(this.currentHaste) * 1000;

    //TODO: ~~Adjust GCD based on cast time of spells, since they reveal haste levels~~ not necessary, but we can make a method verifying if the cast times match the expected cast times to detect haste buffs not supported
    // Confirmed not necessary

    debug && console.log(`ABC: tot.:${Math.floor(this.totalTimeWasted)}\tthis:${Math.floor(timeWasted)}\t%c${event.ability.name} (${event.ability.guid}): ${log.begincast ? 'channeled' : 'instant'}\t%cgcd:${Math.floor(gcd)}\t%ccasttime:${event.timestamp - begincast.timestamp}\tfighttime:${timestamp - this.owner.fight.start_time}`, 'color:red', 'color:green', 'color:black', event);

    this.lastCastFinishedTimestamp = Math.max(begincast.timestamp + gcd, event.timestamp);
    if (countsAsHealingAbility) {
      this.lastHealingCastFinishedTimestamp = Math.max(begincast.timestamp + gcd, event.timestamp);
    }
    this._currentlyCasting = null;
  }
  baseHaste = null;
  currentHaste = null;
  on_byPlayer_combatantinfo() {
    const combatant = this.owner.modules.combatants.selected;
    this.baseHaste = combatant.hastePercentage;
    this.currentHaste = this.baseHaste;

    debug && console.log(`ABC: Current haste: ${this.currentHaste}`);

    if (combatant.hasTalent(TALENT_ROWS.LV15, CRUSADERS_MIGHT_SPELL_ID)) {
      HEALING_ABILITIES_ON_GCD.push(CRUSADER_STRIKE_SPELL_ID);
    }
  }
  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (HASTE_BUFFS[spellId]) {
      this.currentHaste = this.constructor.applyHasteGain(this.currentHaste, HASTE_BUFFS[spellId]);

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (gained ${HASTE_BUFFS[spellId]} from ${spellId})`);
    }
  }
  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (HASTE_BUFFS[spellId]) {
      this.currentHaste = this.constructor.applyHasteLoss(this.currentHaste, HASTE_BUFFS[spellId]);

      debug && console.log(`ABC: Current haste: ${this.currentHaste} (lost ${HASTE_BUFFS[spellId]} from ${spellId})`);
    }
  }
  //TODO: This won't work properly with a prepull Bloodlust as it will remove 30% Haste while it was never applied in the first place

  on_finished() {
    const fightDuration = this.owner.fight.end_time - this.owner.fight.start_time;
    console.log('totalTimeWasted:', this.totalTimeWasted, 'totalTime:', fightDuration, (this.totalTimeWasted / fightDuration));
    console.log('totalHealingTimeWasted:', this.totalHealingTimeWasted, 'totalTime:', fightDuration, (this.totalHealingTimeWasted / fightDuration));

    const buffs = this.owner.modules.buffs;

    let lastCastTimestamp = this.owner.fight.start_time;
    let lastHealCastTimestamp = this.owner.fight.start_time;
    this.totalTimeWasted = 0;
    this.totalHealingTimeWasted = 0;

    const baseHaste = this.owner.modules.combatants.selected.hastePercentage;

    this.castLog.forEach((event) => {
      if (!event.cast) {
        console.log(`%c${event.ability.name} (${event.ability.guid}) interrupted`, 'color: red');
        return;
      }
      const spellId = event.ability.guid;
      const isOnGcd = ABILITIES_ON_GCD.indexOf(spellId) !== -1;
      const isHealOnGcd = HEALING_ABILITIES_ON_GCD.indexOf(spellId) !== -1;

      if (!isOnGcd) {
        console.log(`%c${event.ability.name} (${event.ability.guid}) ignored`, 'color: gray');
        return;
      }
      const begincast = event.begincast || event.cast;
      const timestamp = begincast.timestamp;
      const timeWasted = timestamp - lastCastTimestamp;
      this.totalTimeWasted += timeWasted;
      if (isHealOnGcd) {
        const healTimeWasted = timestamp - lastHealCastTimestamp;
        this.totalHealingTimeWasted += healTimeWasted;
      }

      // TODO: Fitler out damaging HS by checking the target
      // TODO: Fitler out CS when not CM

      let haste = baseHaste;
      // TODO: Would be nicer if we would just apply the haste buffs as they happened. Takes less CPU and allows us to adjust the GCD/haste based on the spell cast times
      Object.keys(HASTE_BUFFS).forEach((spellId) => {
        if (buffs.hasBuff(spellId, 0, timestamp)) {
          haste = this.constructor.applyHasteGain(haste, HASTE_BUFFS[spellId]);
        }
      });
      const gcd = this.constructor.calculateGlobalCooldown(haste) * 1000;

      //TODO: ~~Adjust GCD based on cast time of spells, since they reveal haste levels~~ not necessary, but we can make a method verifying if the cast times match the expected cast times to detect haste buffs not supported

      // console.log(Math.floor(this.totalTimeWasted), Math.floor(timeWasted), `${event.ability.name} (${event.ability.guid}): ${event.begincast ? 'channeled' : 'instant'}`, Math.floor(gcd)/1000, event.cast.timestamp - timestamp, timestamp - this.owner.fight.start_time);
      // TODO: Add GCD time to `timestamp` of the `cast` or if available
      lastCastTimestamp = Math.max(timestamp + gcd, event.cast.timestamp);
      if (isHealOnGcd) {
        lastHealCastTimestamp = Math.max(timestamp + gcd, event.cast.timestamp);
      }
    });
    // TODO: add time until end of fight
    console.log('totalTimeWasted:', this.totalTimeWasted, 'totalTime:', fightDuration, (this.totalTimeWasted / fightDuration));
    console.log('totalHealingTimeWasted:', this.totalHealingTimeWasted, 'totalTime:', fightDuration, (this.totalHealingTimeWasted / fightDuration));
  }

  static calculateGlobalCooldown(haste) {
    return 1.5 / (1 + haste);
  }
  static applyHasteGain(baseHaste, hasteGain) {
    return baseHaste * (1 + hasteGain) + hasteGain;
  }
  static applyHasteLoss(baseHaste, hasteLoss) {
    return (baseHaste - hasteLoss) / (1 + hasteLoss);
  }
}


export default AlwaysBeCasting;
