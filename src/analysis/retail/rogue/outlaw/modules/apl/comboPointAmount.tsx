import { hasResource, describe } from 'parser/shared/metrics/apl/conditions';
import { tenseAlt } from 'parser/shared/metrics/apl';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

/*
 * TODO:
 * Due to how resource events are batched, eg. you press a builder, you get the resource event,
 * before the cast event, cp ruling can be a bit off sometimes.
 * Ideally we'd just grab the proper values using this.comboPointTracker.resourceUpdates.at(-1)
 * but until APLCheck is turned into a proper analyzer, we can't do that.
 */

export const finisherComboPointAmount = (cp: number) => {
  return describe(
    hasResource(RESOURCE_TYPES.COMBO_POINTS, { atLeast: cp }, undefined, true),
    (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} {cp}+ CPs
      </>
    ),
  );
};

export const builderComboPointAmount = (cp: number) => {
  return describe(
    hasResource(RESOURCE_TYPES.COMBO_POINTS, { atMost: cp }, undefined, true),
    (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} at most {cp} CPs
      </>
    ),
  );
};
