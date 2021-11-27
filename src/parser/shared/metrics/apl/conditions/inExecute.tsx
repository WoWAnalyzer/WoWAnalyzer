import { formatPercentage } from 'common/format';
import { EventType } from 'parser/core/Events';

import { Condition, tenseAlt } from '../index';

export type TargetHealth = { [targetId: number]: number };

/**
 * This function expects a health treshold as a decimal ex. 80% = .8
 * It defaults to assuming excute is below 20%
 * If you need to execute above a threshold aka venthyr use the negative
 * Ex. execute above 80 = inExecute(-.8)
 *
 * If you need above and below a threshold use and()
 */
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
    validate: (state, event) => {
      if (threshold < 0) {
        return event.targetID ? state[event.targetID] >= 1 + threshold : false;
      } else {
        return event.targetID ? state[event.targetID] <= threshold : false;
      }
    },
    describe: (tense) => (
      <>
        your target {tenseAlt(tense, 'is', 'was')} {threshold < 0 ? 'above' : 'below'}{' '}
        {formatPercentage(threshold, 0)}% HP
      </>
    ),
  };
}
