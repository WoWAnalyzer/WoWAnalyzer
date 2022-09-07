import DistanceMoved from 'parser/shared/modules/DistanceMoved';
import { encodeTargetString } from 'parser/shared/modules/Enemies';

import EarlyDotRefreshes from './EarlyDotRefreshes';

const BUFFER_MS = 100;
const PANDEMIC_WINDOW = 0.3;

// example dot:
// {
//   name: "Sunfire", //name of the spell for display
//   debuffId: SPELLS.SUNFIRE.id, //id of the dot debuff
//   castId: SPELLS.SUNFIRE_CAST.id, //id of the dot cast
//   duration: 18000, //duration of the dot in ms
// },

// Abstract class for tracking bad dot casts.
// See /parser/Druid/Balance/Modules/Features/EarlyDotRefreshesInstants.js for an example implementation.
class EarlyDotRefreshesInstants extends EarlyDotRefreshes {
  static dependencies = {
    ...EarlyDotRefreshes.dependencies,
    distanceMoved: DistanceMoved,
  };

  get lastCastBuffer() {
    return this.lastGCD.duration - BUFFER_MS;
  }

  // Checks the status of the last cast and marks it accordingly.
  getLastBadCastText(event, dot) {
    let text = '';
    if (!this.movedSinceCast(event)) {
      // Dot was refreshed early while standing still.
      text = `${dot.name} was cast while it had more than 30% of its duration remaining on all targets hit and you were standing still.`;
    }
    const castWhileMovingBuffName = this.couldCastWhileMoving(this.lastCast, event);
    if (castWhileMovingBuffName) {
      // Dot was refreshed early and player was able to cast on the move.
      text = `${dot.name} was cast while it had more than 30% of its duration remaining on all targets hit and you had ${castWhileMovingBuffName} active, allowing you to cast better spells while moving.`;
    }
    const betterFillers = this.betterFillersAvailable(this.lastCast);
    if (betterFillers && betterFillers.length > 0) {
      // A better movement filler was available.
      let fillers = '';
      for (let i = 0; i < betterFillers.length; i += 1) {
        fillers += betterFillers[i];
        if (i + 2 < betterFillers.length) {
          fillers += ', ';
        } else if (i + 1 < betterFillers.length) {
          fillers += ' and ';
        }
      }
      text = `${dot.name} was cast while it had more than 30% of its duration remaining on all targets hit and you had ${fillers} available as a better filler.`;
    }
    return text;
  }

  movedSinceCast(event) {
    const timeSinceCast = event.timestamp - this.lastGCD.timestamp;
    const timeSinceLastMovement = this.distanceMoved.timeSinceLastMovement();
    if (timeSinceLastMovement !== null && timeSinceLastMovement < timeSinceCast) {
      return true;
    }
    return false;
  }

  // Extend this for your spec and return the name of the buff that allowed you to move while casting at the time of the cast.
  couldCastWhileMoving(castEvent, endEvent) {
    return '';
  }

  // Extend this for your spec and return an array with the names of the fillers available at the time of the cast.
  betterFillersAvailable(event) {
    const betterFillers = [];
    // If another movement filler had <30% duration remaining on the target, it would have been a better filler.
    // We only check the primary target since the player might not be interested in refreshing the dot on secondary targets.
    this.constructor.dots
      .filter((dot) => dot.castId !== event.ability.guid)
      .forEach((dot) => {
        const expirationTimestamp =
          this.targets[dot.debuffId][encodeTargetString(event.targetID, event.targetInstance)] || 0;
        const remainingDuration = expirationTimestamp - event.timestamp;
        if (remainingDuration < dot.duration * PANDEMIC_WINDOW) {
          betterFillers.push(dot.name);
        }
      });
    return betterFillers;
  }
}

export default EarlyDotRefreshesInstants;
