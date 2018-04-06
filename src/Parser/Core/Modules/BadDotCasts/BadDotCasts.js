import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';
import DistanceMoved from 'Parser/Core/Modules/Others/DistanceMoved';

const BUFFER_MS = 100;
const PANDEMIC_WINDOW = 0.3;

// example dot:
// {
//   name: "Sunfire", //name of the spell for display
//   debuffId: SPELLS.SUNFIRE.id, //id of the dot debuff
//   castId: SPELLS.SUNFIRE_CAST.id, //id of the dot cast
//   duration: 18000, //duration of the dot in ms
//   movementFiller: true, //if the dot is considered a movement filler
// },

// Abstract class for tracking bad dot casts. 
// See /Parser/Druid/Balance/Modules/Features/BadDotCasts.js for an example implementation.
class BadDotCasts extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
    abilityTracker: AbilityTracker,
    distanceMoved: DistanceMoved,
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
    if (this.checkIfLastCastWasBad(event)) {
      this.lastGCD = null;
      this.lastCast = null;
    }
    const dot = this.dots.find(element => {
      return element.castId === event.ability.guid;
    });
    if (!dot) {
      return;
    }
    this.lastCast = event;
    this.lastCastGoodExtension = false;
  }

  // Returns true if cast was successfully checked, false otherwise.
  checkIfLastCastWasBad(event) {
    if (!this.lastGCD || !this.lastCast) {
      return false;
    }
    // Since we don't have events for end of GCDs, we check on the first event after roughly a gcd has pasted.
    const timeSinceCast = event.timestamp - this.lastGCD.timestamp;
    if (timeSinceCast < this.lastGCD.duration - BUFFER_MS){
      return false;
    }
    if (this.lastCastGoodExtension) {
      return true;
    }
    const dot = this.dots.find(element => {
      return element.castId === this.lastCast.ability.guid;
    });
    let text = '';
    if (!dot.movementFiller) { // Dot was refreshed early and is not a movement filler.
      text = `${dot.name} was cast while it had more than 30% of its duration remaining on all targets hit.`;
    }
    if (!this.movedSinceCast(event)) { // Dot was refreshed early while standing still.
      text = `${dot.name} was cast while it had more than 30% of its duration remaining on all targets hit and you were standing still.`;
    }
    const castWhileMovingBuffName = this.couldCastWhileMoving(this.lastCast, event);
    if (castWhileMovingBuffName) { // Dot was refreshed early and player was able to cast on the move.
      text = `${dot.name} was cast while it had more than 30% of its duration remaining on all targets hit and you had ${castWhileMovingBuffName} active, allowing you to cast better spells while moving.`;
    }
    const betterFillers = this.betterFillersAvailable(this.lastCast);
    if (betterFillers && betterFillers.length > 0) { // A better movement filler was available.
      let fillers = '';
      for (let i = 0; i < betterFillers.length; i++) {
        fillers += betterFillers[i];
        if (i + 2 < betterFillers.length){
          fillers += ', ';
        } else if (i + 1 < betterFillers.length) {
          fillers += ' and ';
        }
      }
      text = `${dot.name} was cast while it had more than 30% of its duration remaining on all targets hit and you had ${fillers} available as a better filler.`;
    }
    if (text !== '') {
      this.addBadCast(this.lastCast, text);
    }
    return true;
  }

  movedSinceCast(event) {
    const timeSinceCast = event.timestamp - this.lastGCD.timestamp;
    const timeSinceLastMovement = this.distanceMoved.timeSinceLastMovement();
    if (timeSinceLastMovement < timeSinceCast) {
      return true;
    }
    return false;
  }

  // Extend this for your spec and return the name of the buff that allowed you to move while casting at the time of the cast.
  couldCastWhileMoving(castEvent, endEvent) {
    return false;
  }

  // Extend this for your spec and return an array with the names of the fillers available at the time of the cast.
  betterFillersAvailable(event) {
    const betterFillers = [];
    // If another movement filler had <30% duration remaining on the target, it would have been a better filler.
    // We only check the primary target since the player might not be interested in refreshing the dot on secondary targets.
    this.dots
      .filter(dot => dot.movementFiller && dot.castId !== event.ability.guid)
      .forEach(dot => {
        const expirationTimestamp = this.targets[dot.debuffId][encodeTargetString(event.targetID, event.targetInstance)] || 0;
        const remainingDuration = expirationTimestamp - event.timestamp;
        if (remainingDuration < dot.duration * PANDEMIC_WINDOW) {
          betterFillers.push(dot.name);
        }
      });
    return betterFillers;
  }

  // Extends the dot and returns true if it was a good extension (no duration wasted) or false if it was a bad extension.
  extendDot(spellId, targetID, extension, timestamp) {
    const dot = this.dots.find(element => {
      return element.debuffId === spellId;
    });
    if (!dot) {
      return;
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

export default BadDotCasts;
