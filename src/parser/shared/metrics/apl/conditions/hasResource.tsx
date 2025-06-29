import type { Resource } from 'game/RESOURCE_TYPES';
import { ResourceLink } from 'interface';
import { ClassResources, EventType } from 'parser/core/Events';

import { AplTriggerEvent, Condition, tenseAlt } from '../index';
import { Range, formatRange } from './index';

export interface ResourceInformation {
  current: number;
  previous: number;
}

const castResource = (resource: Resource, event: AplTriggerEvent): ClassResources | undefined =>
  event.classResources?.find(({ type }) => type === resource.id);

const rangeSatisfied = (actualAmount: number, range: Range): boolean => {
  return (
    actualAmount >= (range.atLeast || 0) &&
    (range.atMost === undefined || actualAmount <= range.atMost)
  );
};

// NOTE: this doesn't explicitly model natural regen (mana, energy, focus) but
// when the classResources are present it does use those as the main source of
// truth, which should accomodate them in the vast majority of cases.
// use initial to set the expected initial resources on fight start
// use getResourceBeforeCast to get the resource amount from before the current cast
// this is useful when resource events are fired before the cast event
// getResourceBeforeCast only applies to events that don't carry the castResource
export default function hasResource(
  resource: Resource,
  range: Range,
  initial?: number,
  getResourceBeforeCast?: boolean,
): Condition<ResourceInformation> {
  return {
    key: `hasResource-${resource.id}`,
    init: () => ({ current: initial ?? 0, previous: initial ?? 0 }),
    update: (state, event) => {
      if (event.type === EventType.ResourceChange && event.resourceChangeType === resource.id) {
        return {
          current: event.resourceChange - event.waste + state.current,
          previous: state.current,
        };
      } else if (event.type === EventType.Cast) {
        const res = castResource(resource, event);
        if (res) {
          return { current: res.amount - (res.cost || 0), previous: state.current };
        } else {
          return state;
        }
      } else {
        return state;
      }
    },
    validate: (state, event) => {
      const res = castResource(resource, event);
      // If the event carries the proper resource amount, it should be safe to ignore getResourceBeforeCast
      if (res) {
        return rangeSatisfied(res.amount, range);
      } else {
        return rangeSatisfied(getResourceBeforeCast ? state.previous : state.current, range);
      }
    },
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} {formatRange(range)}{' '}
        <ResourceLink id={resource.id} icon />
      </>
    ),
  };
}
