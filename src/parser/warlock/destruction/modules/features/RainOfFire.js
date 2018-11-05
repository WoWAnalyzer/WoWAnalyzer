import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import Haste from 'parser/shared/modules/Haste';

import SPELLS from 'common/SPELLS';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';

const BUFFER = 100;
const BASE_ROF_DURATION = 8000;

// Tries to estimate "effectiveness" of Rain of Fires - counting average targets hit by each RoF (unique targets hit)
class RainOfFire extends Analyzer {
  static dependencies = {
    haste: Haste,
  };

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
      timestamp: event.timestamp,
      expectedEnd: event.timestamp + this._expectedRoFduration,
      targetsHit: [],
      periods: [],
      lastTickTimestamp: null,
    });
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.RAIN_OF_FIRE_DAMAGE.id) {
      return;
    }
    // filter ROF that should be still active
    const filtered = this.casts.filter(cast => event.timestamp <= cast.expectedEnd + BUFFER);
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (filtered.length === 1) {
      // single active ROF, attribute the targets hit to it
      const cast = filtered[0];
      const timeSinceLastTick = event.timestamp - (cast.lastTickTimestamp || cast.timestamp);
      // damage events usually arrive at the same timestamp but there is a small window for lag
      if (timeSinceLastTick > BUFFER) {
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
      // if any cast's last tick is within 100ms of current timestamp, it's probably still the same tick
      const possibleCurrentTickCast = filtered.find(cast => event.timestamp <= cast.lastTickTimestamp + BUFFER);
      if (possibleCurrentTickCast) {
        if (!possibleCurrentTickCast.targetsHit.includes(target)) {
          possibleCurrentTickCast.targetsHit.push(target);
        }
      }
      else {
        // it's a "fresh" damage tick (first of them)
        // need to find out which cast in `filtered` it "belongs to"
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
        const closest = sortedByDelta[0].cast;
        const timeSinceLastTick = event.timestamp - (closest.lastTickTimestamp || closest.timestamp);
        closest.periods.push(timeSinceLastTick);
        closest.lastTickTimestamp = event.timestamp;
        if (!closest.targetsHit.includes(target)) {
          closest.targetsHit.push(target);
        }
      }
    }
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

  get averageTargetsHit() {
    // first, maps the casts to the targets hit, resulting in array of array of strings
    // [].concat(...array) just flattens it into single array of strings
    const allTargetsHit = [].concat(...this.casts.map(cast => cast.targetsHit));
    return allTargetsHit.length / this.casts.length;
  }

  statistic() {
    // there's no point in showing the statistic on single target fight with no ROF casts
    if (this.casts.length === 0) {
      return null;
    }
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RAIN_OF_FIRE_CAST.id} />}
        value={this.averageTargetsHit.toFixed(2)}
        label={'Average targets hit with Rain of Fire'}
        tooltip="There's a possibility of a mistake in assigning targets hit to individual casts, when there are multiple Rains of Fire overlapping."
      />
    );
  }
}

export default RainOfFire;
