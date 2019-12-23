import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import { formatDuration } from 'common/format';

const BUFFER_MS = 100;
const PANDEMIC_WINDOW = 0.3;

// example dot:
// {
//   name: "Stellar Flare", //name of the spell for display
//   debuffId: SPELLS.STELLAR_FLARE_TALENT.id, //id of the dot debuff
//   castId: SPELLS.STELLAR_FLARE_TALENT.id, //id of the dot cast
//   duration: 24000, //duration of the dot in ms
// },

// Abstract class for early dot refreshes
// See /parser/Druid/Balance/Modules/Features/EarlyDotRefreshes.js for an example implementation.
class EarlyDotRefreshes extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    abilityTracker: AbilityTracker,
  };

  static dots = [];
  targets = {};
  lastGCD = null;
  lastCast = null;
  lastCastGoodExtension = false;
  lastCastMinWaste = Number.MAX_SAFE_INTEGER;
  lastCastMaxEffect = 0;
  casts = {};

  constructor(...args) {
    super(...args);
    this.constructor.dots.forEach(dot => {
      this.targets[dot.debuffId] = {};
      this.casts[dot.castId] = {
        badCasts: 0,
        addedDuration: 0,
        wastedDuration: 0,
      };
    });
  }

  addBadCast(event, text) {
    this.casts[this.lastCast.ability.guid].badCasts += 1;
    this.casts[this.lastCast.ability.guid].wastedDuration += this.lastCastMinWaste;
    event.meta = event.meta || {};
    event.meta.isInefficientCast = true;
    event.meta.inefficientCastReason = text;
  }

  on_byPlayer_refreshdebuff(event) {
    const dot = this.getDot(event.ability.guid);
    if (!dot) {
      return;
    }
    const targetID = encodeTargetString(event.targetID, event.targetInstance);
    const extensionInfo = this.extendDot(dot.debuffId, targetID, dot.duration, event.timestamp);
    if(this.lastCastGoodExtension){
      return;
    }
    this.lastCastGoodExtension = extensionInfo.wasted === 0;
    this.lastCastMinWaste = Math.min(this.lastCastMinWaste, extensionInfo.wasted);
    this.lastCastMaxEffect = Math.max(this.lastCastMaxEffect, extensionInfo.effective);
  }

  on_byPlayer_applydebuff(event) {
    const dot = this.getDot(event.ability.guid);
    if (!dot) {
      return;
    }
    this.targets[dot.debuffId][encodeTargetString(event.targetID, event.targetInstance)] = event.timestamp + dot.duration;
    this.lastCastGoodExtension = true;
    this.lastCastMinWaste = 0;
    this.lastCastMaxEffect = dot.duration;
  }

  on_byPlayer_globalcooldown(event) {
    const dot = this.getDotByCast(event.ability.guid);
    if (!dot) {
      return;
    }
    this.lastGCD = event;
  }

  on_byPlayer_cast(event) {
    this.checkLastCast(event);
    const dot = this.getDotByCast(event.ability.guid);
    if (!dot) {
      return;
    }
    this.lastCast = event;
    this.lastCastGoodExtension = false;
    this.lastCastMinWaste = Number.MAX_SAFE_INTEGER;
    this.lastCastMaxEffect = 0;
    this.afterLastCastSet(event);
  }

  afterLastCastSet(event) {
    //Extension to help capture state during the "LastCast".
  }

  // Determines whether the last cast should be checked or not.
  checkLastCast(event) {
    if (!this.lastGCD || !this.lastCast) {
      return;
    }
    // We wait roughly a GCD to check, to account for minor travel times.
    const timeSinceCast = event.timestamp - this.lastGCD.timestamp;
    if (timeSinceCast < this.lastCastBuffer){
      return;
    }
    this.casts[this.lastCast.ability.guid].addedDuration += this.lastCastMaxEffect;
    this.isLastCastBad(event);
    this.lastGCD = null;
    this.lastCast = null;
  }

  get lastCastBuffer() {
    return this.lastGCD.duration * 2 - BUFFER_MS;
  }

  // Checks the status of the last cast and marks it accordingly.
  isLastCastBad(event) {
    if (this.lastCastGoodExtension) {
      return; // Should not be marked as bad.
    }
    const dot = this.getDotByCast(this.lastCast.ability.guid);
    const text = this.getLastBadCastText(event, dot);
    if (text !== '') {
      this.addBadCast(this.lastCast, text);
    }
  }

  // Get the suggestion for last bad cast. If empty, cast will be considered good.
  getLastBadCastText(event, dot) {
    return `${dot.name} was refreshed ${formatDuration(this.lastCastMinWaste/1000)} seconds before the pandemic window. It should be refreshed with at most ${formatDuration(PANDEMIC_WINDOW * dot.duration/1000)} left or part of the dot will be wasted.`;
  }

  //Returns the dot object
  getDot(spellId) {
    const dot = this.constructor.dots.find(element => {
      return element.debuffId === spellId;
    });
    return dot;
  }

  //Returns the dot object
  getDotByCast(spellId) {
    const dot = this.constructor.dots.find(element => {
      return element.castId === spellId;
    });
    return dot;
  }

  // Extends the dot and returns true if it was a good extension (no duration wasted) or false if it was a bad extension.
  extendDot(spellId, targetID, extension, timestamp) {
    const dot = this.getDot(spellId);
    if (!dot) {
      throw new Error(`The spellID ${spellId} is not in the list of dots to track`);
    }
    const remainingDuration = this.targets[dot.debuffId][targetID] - timestamp || 0;
    const newDuration = remainingDuration + extension;
    const maxDuration = (1 + PANDEMIC_WINDOW) * dot.duration;
    const lostDuration = newDuration - maxDuration;
    if (lostDuration <= 0) { //full extension
      this.targets[dot.debuffId][targetID] = timestamp + newDuration;
      return {wasted: 0, effective: extension};
    } // Else not full extension
    this.targets[dot.debuffId][targetID] = timestamp + maxDuration;
    return {wasted: lostDuration, effective: extension - lostDuration};
  }

  badCastsPercent(spellId) {
    const ability = this.abilityTracker.getAbility(spellId);
    return this.casts[spellId].badCasts / ability.casts || 0;
  }

  badCastsEffectivePercent(spellId) {
    if(!this.casts[spellId].addedDuration) return 1;
    return this.casts[spellId].addedDuration / (this.casts[spellId].addedDuration+this.casts[spellId].wastedDuration);
  }

  makeSuggestionThresholds(spell, minor, avg, major) {
    return {
      spell: spell,
      count: this.casts[spell.id].badCasts,
      wastedDuration: this.casts[spell.id].wastedDuration,
      actual: this.badCastsEffectivePercent(spell.id),
      isLessThan: {
        minor: minor,
        average: avg,
        major: major,
      },
      style: 'percentage',
    };
  }
}

export default EarlyDotRefreshes;
