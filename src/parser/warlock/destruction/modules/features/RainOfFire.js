/* Tries to estimate "effectiveness" of Rain of Fires - counting average targets hit by each RoF (unique targets hit)
 Rain of Fire has a 8 second HASTED duration over certain area
 Since Rain of Fire doesn't have a cooldown (although it has considerable resource cost), player can overlay multiple RoF, making it pretty hard to say which damage event belongs to which RoF

 potential solution would be to work with tick frequency/period, since ROF ticks on all affected targets at once
 RoF ALWAYS ticks 8 times, but since the duration is hasted, tick period is hasted as well
 http://localhost:3000/report/7aKQwdf4M86BcGgx/46-Mythic+Zul+-+Kill+(3:23)/83-Strungol/events

  group damage events together, +- 100ms buffer
  count 8 ticks
  try to redistribute overlapping ticks? or perhaps from hasted tick period (1 / (1 + haste))
 general algorithm?

  1) on cast - store timestamp, expected duration from current haste (8 / (1 + haste))
  2) on damage
    filter cast queue only by those that could be "attributed to" (damage timestamp <= cast timestamp + expected duration)
    if there's only one cast in queue
      store cast's tick timestamp (grouped by 100ms buffer)
      calculate diff from last tick/cast => store period into array (in order to calculate average)
      mark target as hit
    if there are more casts in queue (realistically I assume either 2 or max 3)
      we need to take into account all casts last tick timestamp + their tick period
      check for possibility of a cast tick CURRENTLY OCCURING => if any cast's last tick is +- 100ms of current dmg event, it's probably the same tick
      if it's a "fresh" tick, pick a cast X, so that X's last tick + average tick period is closest to damage event
 */
import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import Haste from 'parser/shared/modules/Haste';

import SPELLS from 'common/SPELLS';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';

const BUFFER = 100;
const BASE_ROF_DURATION = 8000;
const debug = false;

class RainOfFire extends Analyzer {
  static dependencies = {
    haste: Haste,
  };

  _i = 0;
  _debugMessage = [];
  casts = [
    /*
      {
        timestamp: number,
        expectedEnd: number,
        targetsHit: [string...],
        periods: [number...],
        lastTickTimestamp: number,
      }
     */
  ];

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.RAIN_OF_FIRE_CAST.id) {
      return;
    }
    this.casts.push({
      index: this._i,
      timestamp: event.timestamp,
      expectedEnd: event.timestamp + this._expectedRoFduration,
      targetsHit: [],
      periods: [],
      lastTickTimestamp: null,
    });
    this._i++;
    debug && this.log('Logged ROF cast, current array: ', this._debugSnapshotObject(this.casts));
  }

  _debugSnapshotObject(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.RAIN_OF_FIRE_DAMAGE.id) {
      return;
    }
    // filter ROF that should be still active
    const filtered = this.casts.filter(cast => event.timestamp <= cast.expectedEnd + BUFFER);
    if (debug) {
      this._debugMessage = ['ROF damage, filtered casts: ', this._debugSnapshotObject(filtered)];
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (filtered.length === 1) {
      // single active ROF, attribute the targets hit to it
      const cast = filtered[0];
      debug && this._debugMessage.push('| Single cast in queue', cast);
      const timeSinceLastTick = event.timestamp - (cast.lastTickTimestamp || cast.timestamp);
      // damage events usually arrive at the same timestamp but there is a small window for lag
      if (timeSinceLastTick > BUFFER) {
        debug && this._debugMessage.push('| New tick');
        cast.periods.push(timeSinceLastTick);
        cast.lastTickTimestamp = event.timestamp;
      }
      // mark target as hit by this ROF
      if (!cast.targetsHit.includes(target)) {
        cast.targetsHit.push(target);
      }
    }
    // TODO: filtered.length === 0? precast ROF?
    else {
      // multiple ROFs active
      debug && this._debugMessage.push('| Multiple casts in queue');
      // if any cast's last tick is within 100ms of current timestamp, it's probably still the same tick
      const possibleCurrentTickCast = filtered.find(cast => event.timestamp <= cast.lastTickTimestamp + BUFFER);
      if (possibleCurrentTickCast) {
        debug && this._debugMessage.push('| Possible cast to pair with tick: ', possibleCurrentTickCast);
        if (!possibleCurrentTickCast.targetsHit.includes(target)) {
          possibleCurrentTickCast.targetsHit.push(target);
        }
      }
      else {
        // it's a "fresh" damage tick (first of them)
        // need to find out which cast in `filtered` it "belongs to"
        debug && this._debugMessage.push('| New tick');
        const sortedByDelta = filtered.map(cast => {
          // for each filtered ROF, get timestamp of next expected tick and get time difference from it and current timestamp
          const expectedTick = (cast.lastTickTimestamp || cast.timestamp) + this._getAveragePeriod(cast);
          const delta = Math.abs(expectedTick - event.timestamp);
          return {
            cast,
            delta,
            expectedTick,
          };
        }).sort((cast1, cast2) => cast1.delta - cast2.delta); // sort ascending, cast with lowest difference is in [0]
        debug && this._debugMessage.push('| Events sorted by delta', sortedByDelta);
        const closest = sortedByDelta[0].cast;
        const timeSinceLastTick = event.timestamp - (closest.lastTickTimestamp || closest.timestamp);
        closest.periods.push(timeSinceLastTick);
        closest.lastTickTimestamp = event.timestamp;
        if (!closest.targetsHit.includes(target)) {
          closest.targetsHit.push(target);
        }
      }
    }
    debug && this._debugMessage.push('| Casts after damage handler: ', this._debugSnapshotObject(this.casts));
    debug && this.log(...this._debugMessage);
  }

  _getAveragePeriod(cast) {
    // gets average period of cast of Rain of Fire, or estimates one from the duration of Rain of Fire (it should always tick 8 times)
    if (cast.periods.length > 0) {
      return (cast.periods.reduce((total, current) => total + current, 0) / cast.periods.length) || 0;
    }
    return (cast.expectedEnd - cast.timestamp) / 8;
  }

  get _expectedRoFduration() {
    return BASE_ROF_DURATION / (1 + this.haste.current);
  }

  statistic() {
    // there's no point in showing the statistic on single target fight with no ROF casts
    if (this.casts.length === 0) {
      return null;
    }
    // first, maps the casts to the targets hit, resulting in array of array of strings
    // [].concat(...array) just flattens it into single array of strings
    const allTargetsHit = [].concat(...this.casts.map(cast => cast.targetsHit));
    const averageTargetsHit = allTargetsHit.length / this.casts.length;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RAIN_OF_FIRE_CAST.id} />}
        value={averageTargetsHit.toFixed(2)}
        label={'Average targets hit with Rain of Fire'}
        tooltip="There's a possibility of a mistake in assigning targets hit to individual casts, when there are multiple Rains of Fire overlapping."
      />
    );
  }
}

export default RainOfFire;
