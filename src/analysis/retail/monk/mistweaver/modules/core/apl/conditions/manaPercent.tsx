import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ClassResources, EventType } from 'parser/core/Events';
import { AplTriggerEvent, Condition, tenseAlt } from 'parser/shared/metrics/apl';
import { Range, formatRange } from 'parser/shared/metrics/apl/conditions';

interface ManaState {
  current: number;
  max: number;
}

const castManaResource = (event: AplTriggerEvent): ClassResources | undefined =>
  event.classResources?.find(({ type }) => type === RESOURCE_TYPES.MANA.id);

const percentSatisfied = (state: ManaState, range: Range): boolean => {
  if (state.max === 0) {
    return false;
  }
  const percent = (state.current / state.max) * 100;
  return percent >= (range.atLeast || 0) && (range.atMost === undefined || percent <= range.atMost);
};

/**
 * Condition that is valid when the player's mana, as a percentage of max, falls within `range`.
 */
export default function manaPercent(range: Range): Condition<ManaState> {
  return {
    key: `manaPercent-${range.atLeast}-${range.atMost}`,
    init: () => ({ current: 0, max: 0 }),
    update: (state, event) => {
      if (
        event.type === EventType.ResourceChange &&
        event.resourceChangeType === RESOURCE_TYPES.MANA.id
      ) {
        return { current: event.resourceChange - event.waste + state.current, max: state.max };
      } else if (event.type === EventType.Cast) {
        const res = castManaResource(event);
        if (res) {
          return { current: res.amount - (res.cost || 0), max: res.max };
        }
      }
      return state;
    },
    validate: (state, event) => {
      const res = castManaResource(event);
      if (res) {
        return percentSatisfied({ current: res.amount, max: res.max }, range);
      }
      return percentSatisfied(state, range);
    },
    describe: (tense) =>
      range.atMost !== undefined && range.atLeast === undefined ? (
        <>you {tenseAlt(tense, "aren't", "weren't")} at full mana</>
      ) : (
        <>
          you {tenseAlt(tense, 'have', 'had')} {formatRange(range)}% mana
        </>
      ),
  };
}
