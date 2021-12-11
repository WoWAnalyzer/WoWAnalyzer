import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';

import { Condition, tenseAlt } from '../index';
import { Range, formatRange } from './index';

export default function spellCharges(spell: Spell, range: Range): Condition<number> {
  return {
    key: `spellCharges-${spell.id}`,
    init: () => 0,
    update: (state, event) => {
      if (event.type === EventType.UpdateSpellUsable && event.ability.guid === spell.id) {
        return event.chargesAvailable;
      } else {
        return state;
      }
    },
    validate: (state, event) =>
      state >= (range.atLeast || 0) && (range.atMost === undefined || state <= range.atMost),
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} {formatRange(range)} charges of{' '}
        <SpellLink id={spell.id} icon />
      </>
    ),
  };
}
