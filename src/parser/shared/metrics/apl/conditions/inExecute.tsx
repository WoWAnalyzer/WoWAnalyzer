import { formatPercentage } from 'common/format';
import { EventType } from 'parser/core/Events';
import React from 'react';

import { Condition, tenseAlt } from '../index';

export type TargetHealth = { [targetId: number]: number };

export default function inExecute(threshold = 0.2): Condition<TargetHealth> {
  return {
    key: `inExecute-${threshold}`,
    init: () => ({}),
    update: (state, event) => {
      if (
        (event.type === EventType.Damage || event.type === EventType.Heal) &&
        event.hitPoints &&
        event.maxHitPoints
      ) {
        // these events include target HP
        state[event.targetID] = event.hitPoints / event.maxHitPoints;
      } else if (event.type === EventType.Cast && event.hitPoints && event.maxHitPoints) {
        // includes source hit points
        state[event.sourceID] = event.hitPoints / event.maxHitPoints;
      }

      return state;
    },
    validate: (state, event) => (event.targetID ? state[event.targetID] <= threshold : false),
    describe: (tense) => (
      <>
        your target {tenseAlt(tense, 'is', 'was')} below {formatPercentage(threshold, 0)}% HP
      </>
    ),
  };
}
