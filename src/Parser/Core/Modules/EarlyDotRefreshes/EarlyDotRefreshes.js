import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';

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
// See /Parser/Druid/Balance/Modules/Features/EarlyDotRefreshes.js for an example implementation.
class EarlyDotRefreshes extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
    abilityTracker: AbilityTracker,
  };

  static dots = [];
  targets = [];
  lastGCD = null;
  lastCast = null;
  lastCastGoodExtension = false;
  badCasts = [];

  on_initialized() {
    this.dots.forEach(dot => {
      this.targets[dot.debuffId] = {};
      this.badCasts[dot.castId] = 0;
    });
  }

  addBadCast(event, text) {
    this.badCasts[event.ability.guid] += 1;
    event.meta = event.meta || {};
    event.meta.isInefficientCast = true;
    event.meta.inefficientCastReason = text;
  }

  on_byPlayer_refreshdebuff(event) {
    const dot = this.dots.find(element => {
      return element.debuffId === event.ability.guid;
    });
    if (!dot) {
      return;
    }
    const targetID = encodeTargetString(event.targetID, event.targetInstance);
    const goodExtension = this.extendDot(dot.debuffId, targetID, dot.duration, event.timestamp);
    if(this.lastCastGoodExtension){
      return;
    }
    this.lastCastGoodExtension = goodExtension;
  }

  on_byPlayer_applydebuff(event) {
    const dot = this.dots.find(element => {
      return element.debuffId === event.ability.guid;
    });
    if (!dot) {
      return;
    }
    this.targets[dot.debuffId][encodeTargetString(event.targetID, event.targetInstance)] = event.timestamp + dot.duration;
    this.lastCastGoodExtension = true;
  }

  on_byPlayer_globalcooldown(event) {
    const dot = this.dots.find(element => {
      return element.castId === event.ability.guid;
    });
    if (!dot) {
      return;
    }
    this.lastGCD = event;
  }

  on_byPlayer_cast(event) {
    this.checkLastCast(event);
    const dot = this.dots.find(element => {
      return element.castId === event.ability.guid;
    });
    if (!dot) {
      return;
    }
    this.lastCast = event;
    this.lastCastGoodExtension = false;
  }

  // Determines whether the last cast should be checked or not.
  checkLastCast(event) {
    if (!this.lastGCD || !this.lastCast) {
      return;
    }
    // We wait roughly a GCD to check, to account for minor travel times.
    const timeSinceCast = event.timestamp - this.lastGCD.timestamp;
    if (timeSinceCast < this.lastGCD.duration * 2 - BUFFER_MS){
      return;
    }
    this.isLastCastBad(event);
    this.lastGCD = null;
    this.lastCast = null;
  }

  // Checks the status of the last cast and marks it accordingly.
  isLastCastBad(event) {
    if (this.lastCastGoodExtension) {
      return; // Should not be marked as bad.
    }
    const dot = this.dots.find(element => {
      return element.castId === this.lastCast.ability.guid;
    });
    const text = `${dot.name} was cast while it had more than 30% of its duration remaining on all targets hit.`;
    this.addBadCast(this.lastCast, text);
  }

  // Extends the dot and returns true if it was a good extension (no duration wasted) or false if it was a bad extension.
  extendDot(spellId, targetID, extension, timestamp) {
    const dot = this.dots.find(element => {
      return element.debuffId === spellId;
    });
    if (!dot) {
      throw new Error(`The spellID ${spellId} is not in the list of dots to track`);
    }
    const remainingDuration = this.targets[dot.debuffId][targetID] - timestamp || 0;
    const newDuration = remainingDuration + extension;
    const maxDuration = (1 + PANDEMIC_WINDOW) * dot.duration;
    if (newDuration < maxDuration) { //full extension
      this.targets[dot.debuffId][targetID] = timestamp + newDuration;
      return true;
    } // Else not full extension
    this.targets[dot.debuffId][targetID] = timestamp + maxDuration;
    return false;   
  }

  badCastsPercent(spellId) {
    const ability = this.abilityTracker.getAbility(spellId);
    return this.badCasts[spellId] / ability.casts || 0;
  }
}

export default EarlyDotRefreshes;
