import type { Resource } from 'game/RESOURCE_TYPES';
import { ResourceLink } from 'interface';
import { ClassResources, EventType } from 'parser/core/Events';

import { AplTriggerEvent, Condition, tenseAlt } from '../index';
import { Range, formatRange } from './index';

export interface ResourceInformation {
  current: number;
  previous: number;
}

export interface HasResourceOptions {
  /** Expected resource amount at the start of the fight, in event units. */
  initial?: number;
  /**
   * Use the tracked amount from before the cast when the cast does not include
   * classResources. This is useful when resource events precede cast events.
   */
  getResourceBeforeCast?: boolean;
  /**
   * Multiplier from event units to player-facing units, used only in the
   * condition description. For example, Runic Power is reported at 10x its
   * in-game value, so its display scale factor is 0.1.
   */
  displayScaleFactor?: number;
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
// The legacy initial/getResourceBeforeCast positional arguments remain supported;
// new callers that need display scaling should use HasResourceOptions.
export default function hasResource(
  resource: Resource,
  range: Range,
  initialOrOptions?: number | HasResourceOptions,
  getResourceBeforeCast?: boolean,
): Condition<ResourceInformation> {
  const options: HasResourceOptions =
    typeof initialOrOptions === 'object'
      ? initialOrOptions
      : { initial: initialOrOptions, getResourceBeforeCast };
  const displayScaleFactor = options.displayScaleFactor ?? 1;
  const displayRange: Range = {
    atLeast: range.atLeast === undefined ? undefined : range.atLeast * displayScaleFactor,
    atMost: range.atMost === undefined ? undefined : range.atMost * displayScaleFactor,
  };

  return {
    key: `hasResource-${resource.id}`,
    init: () => ({ current: options.initial ?? 0, previous: options.initial ?? 0 }),
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
        return rangeSatisfied(
          options.getResourceBeforeCast ? state.previous : state.current,
          range,
        );
      }
    },
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} {formatRange(displayRange)}{' '}
        <ResourceLink id={resource.id} icon />
      </>
    ),
  };
}
