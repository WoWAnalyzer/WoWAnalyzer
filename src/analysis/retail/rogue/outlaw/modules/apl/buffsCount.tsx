import type Spell from 'common/SPELLS/Spell';
import { EventType } from 'parser/core/Events';

import { Condition, tenseAlt } from 'parser/shared/metrics/apl/index';

// Not sure about this function or if it would be used by anything else than outlaw to check rtb buffs count:
// Can input an array of buffs to check, a count, and a comparison tag to check if the user had more or less than 'x' buffs

export function buffsCount(
  spells: Spell[],
  count: number = 1,
  comparison: 'atLeast' | 'lessThan' = 'atLeast',
  latencyOffset: number = 0,
): Condition<number | null> {
  return {
    key: `buffsCount-${spells.map((spell) => spell.id).join('-')}-${count}`,
    init: () => 0,
    update: (state, event) => {
      switch (event.type) {
        case EventType.ApplyBuff:
          if (spells.some((spell) => spell.id === event.ability.guid)) {
            return state !== null ? state + 1 : 0;
          }
          break;
        case EventType.RemoveBuff:
          if (spells.some((spell) => spell.id === event.ability.guid)) {
            return state !== null ? state - 1 : 0;
          }
          break;
      }

      return state !== null ? state : 0;
    },
    validate: (state, event) => {
      if (state === null) {
        return false;
      }

      if (comparison === 'atLeast') {
        return state >= count;
      } else {
        return state < count;
      }
    },
    describe: (tense) => {
      let comparisonString = '';
      if (comparison === 'atLeast') {
        comparisonString = `at least ${count}`;
      } else {
        comparisonString = `less than ${count}`;
      }

      return (
        <>
          {comparisonString} buff{count !== 1 ? 's' : ''} {tenseAlt(tense, 'are', 'were')} present
        </>
      );
    },
  };
}
