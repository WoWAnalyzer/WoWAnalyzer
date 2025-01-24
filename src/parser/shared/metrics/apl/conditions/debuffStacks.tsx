import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';

import { Condition, tenseAlt } from '../index';
import { Range, formatRange } from './index';

export default function debuffStacks(spell: Spell, range: Range): Condition<number> {
  return {
    key: `debuffStacks-${spell.id}`,
    init: () => 0,
    update: (state, event) => {
      switch (event.type) {
        case EventType.ApplyDebuffStack:
          if (event.ability.guid === spell.id) {
            return event.stack;
          }
          break;
        case EventType.ApplyDebuff:
          if (event.ability.guid === spell.id) {
            return 1;
          }
          break;
        case EventType.RemoveDebuffStack:
          if (event.ability.guid === spell.id) {
            return event.stack;
          }
          break;
        case EventType.RemoveDebuff:
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
        enemies {tenseAlt(tense, 'have', 'had')} {formatRange(range)}{' '}
        <SpellLink spell={spell.id} icon /> stacks
      </>
    ),
  };
}
