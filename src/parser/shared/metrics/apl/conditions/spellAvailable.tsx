import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { UpdateSpellUsableEvent, EventType } from 'parser/core/Events';

import { Condition, tenseAlt } from '../index';

export default function spellAvailable(
  spell: Spell,
  inverse: boolean = false,
): Condition<UpdateSpellUsableEvent | null> {
  return {
    key: `spellAvailable-${spell.id}`,
    init: () => null,
    update: (state, event) => {
      if (event.type === EventType.UpdateSpellUsable && event.ability.guid === spell.id) {
        return event;
      } else {
        return state;
      }
    },
    validate: (state, _event) => state === null || state.isAvailable,
    describe: (tense) => (
      <>
        <SpellLink spell={spell.id} /> {tenseAlt(tense, 'is', 'was')} {inverse ? 'on' : 'off'}{' '}
        cooldown
      </>
    ),
  };
}
