import SPELLS from 'common/SPELLS';
import { formatDuration } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import Haste from './Haste';

const debug = false;

class AlwaysBeCasting extends Module {
  static dependencies = {
    combatants: Combatants,
    haste: Haste,
  };

  // TODO: Should all this props be lower case?
  static ABILITIES_ON_GCD = [
    // Extend this class and override this property in your spec class to implement this module.
  ];
  static STATIC_GCD_ABILITIES = {
    //Abilities which GCD is not affected by haste.
    //[spellId] : [gcd value in seconds]
  };

  // TODO: Add channels array to fix issues where is channel started pre-combat it doesn't register the `begincast` and considers the finish a GCD adding downtime. This can also be used to automatically add the channelVerifiers.

  static BASE_GCD = 1500;
  static MINIMUM_GCD = 750;

  /**
   * The amount of milliseconds not spent casting anything or waiting for the GCD.
   * @type {number}
   */
  totalTimeWasted = 0;

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
  _lastCastFinishedTimestamp = null;
  recordCastTime(
    castStartTimestamp,
    globalCooldown,
    begincast,
    cast,
    spellId
  ) {
    const timeWasted = castStartTimestamp - (this._lastCastFinishedTimestamp || this.owner.fight.start_time);
    this.totalTimeWasted += timeWasted;

    debug && console.log(`ABC: tot.:${Math.floor(this.totalTimeWasted)}\tthis:${Math.floor(timeWasted)}\t%c${cast.ability.name} (${spellId}): ${begincast ? 'channeled' : 'instant'}\t%cgcd:${Math.floor(globalCooldown)}\t%ccasttime:${cast.timestamp - castStartTimestamp}\tfighttime:${formatDuration((castStartTimestamp - this.owner.fight.start_time) / 1000)}`, 'color:red', 'color:green', 'color:black');

    this._lastCastFinishedTimestamp = Math.max(castStartTimestamp + globalCooldown, cast.timestamp);
  }
  on_finished() {
    const timeWasted = this.owner.fight.end_time - (this._lastCastFinishedTimestamp || this.owner.fight.start_time);
    this.totalTimeWasted += timeWasted;
  }

  getCurrentGlobalCooldown(spellId = null) {
    return (spellId && this.constructor.STATIC_GCD_ABILITIES[spellId]) || this.constructor.calculateGlobalCooldown(this.haste.current);
  }

  /**
   * Can be used to determine the accuracy of the Haste tracking. This does not work properly on abilities that can get reduced channel times from other effects such as talents or traits.
   */
  _verifyChannel(spellId, defaultCastTime, begincast, cast) {
    if (cast.ability.guid === spellId) {
      if (!begincast) {
        console.error('Missing begin cast for channeled ability:', cast);
        return;
      }

      const actualCastTime = cast.timestamp - begincast.timestamp;
      const expectedCastTime = Math.round(defaultCastTime / (1 + this.haste.current));
      if (!this.constructor.inRange(actualCastTime, expectedCastTime, 50)) { // cast times seem to fluctuate by 50ms, not sure if it depends on player latency, in that case it could be a lot more flexible
        console.warn(`ABC: ${SPELLS[spellId].name} channel: Expected actual ${actualCastTime}ms to be expected ${expectedCastTime}ms ± 50ms @ ${formatDuration((cast.timestamp - this.owner.fight.start_time) / 1000)}`, this.combatants.selected.activeBuffs());
      }
    }
  }

  static calculateGlobalCooldown(haste) {
    const gcd = this.BASE_GCD / (1 + haste);
    // Global cooldowns can't normally drop below a certain threshold
    return Math.max(this.MINIMUM_GCD, gcd);
  }
  static inRange(num1, goal, buffer) {
    return num1 > (goal - buffer) && num1 < (goal + buffer);
  }
}

export default AlwaysBeCasting;
