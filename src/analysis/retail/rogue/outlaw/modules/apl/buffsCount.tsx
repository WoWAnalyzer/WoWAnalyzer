import type Spell from 'common/SPELLS/Spell';
import { EventType } from 'parser/core/Events';
import { Condition, tenseAlt } from 'parser/shared/metrics/apl/index';

// Not sure about this function or if it would be used by anything else than outlaw to check rtb buffs count:
// Can input an array of buffs to check, a count, and a comparison tag to check if the user had more or less than 'x' buffs

export function buffsCount(
  spells: Spell[],
  count: number = 1,
  comparison: 'atLeast' | 'lessThan' = 'atLeast',
): Condition<{ [key: number]: number }> {
  return {
    key: `buffsCount-${spells.map((spell) => spell.id).join('-')}-${count}`,
    init: () => ({}),
    update: (state, event) => {
      switch (event.type) {
        case EventType.ApplyBuff:
          if (spells.some((spell) => spell.id === event.ability.guid)) {
            if (state === null) {
              state = {};
            }
            state[event.ability.guid] = event.timestamp;

            return state;
          }
          break;
        case EventType.RemoveBuff:
          if (spells.some((spell) => spell.id === event.ability.guid)) {
            if (state !== null) {
              delete state[event.ability.guid];
            }
            return state;
          }
          break;
      }
      return state;
    },
    validate: (state, event) => {
      if (state === null) {
        return false;
      }

      let buffs = 0;
      for (const timestamp of Object.values(state)) {
        // we ignore buffs *just* applied, since they are most likely a result of this very spell cast
        if (timestamp + 200 < event.timestamp) {
          buffs += 1;
        }
      }

      if (comparison === 'atLeast') {
        return buffs >= count;
      } else {
        return buffs < count;
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
