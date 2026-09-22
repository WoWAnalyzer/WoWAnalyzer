import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';

import { Condition, pluralAlt, tenseAlt } from '../index';
import { Range, formatRange } from './index';

export default function buffStacks(spell: Spell, range: Range): Condition<number> {
  return {
    key: `buffStacks-${spell.id}`,
    init: () => 0,
    update: (state, event) => {
      switch (event.type) {
        case EventType.ApplyBuffStack:
          if (event.ability.guid === spell.id) {
            return event.stack;
          }
          break;
        case EventType.ApplyBuff:
          if (event.ability.guid === spell.id) {
            return 1;
          }
          break;
        case EventType.RemoveBuffStack:
          if (event.ability.guid === spell.id) {
            return event.stack;
          }
          break;
        case EventType.RemoveBuff:
          if (event.ability.guid === spell.id) {
            return 0;
          }
          break;
      }
      return state;
    },
    validate: (state, _event) =>
      state >= (range.atLeast || 0) && (range.atMost === undefined || state <= range.atMost),
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} {formatRange(range)}{' '}
        <SpellLink spell={spell.id} icon />{' '}
        {pluralAlt(range.atMost ?? range.atLeast ?? 0, 'stack', 'stacks')}
      </>
    ),
  };
}
