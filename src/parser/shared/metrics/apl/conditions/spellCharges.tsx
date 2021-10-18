import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { UpdateSpellUsableEvent, EventType } from 'parser/core/Events';
import React from 'react';

import { Condition, cooldownEnd, tenseAlt } from '../index';

export default function spellCharges(
  spell: Spell,
  charges: number,
): Condition<UpdateSpellUsableEvent | null> {
  return {
    key: `spellCharges-${spell.id}`,
    init: () => null,
    update: (state, event) => {
      if (event.type === EventType.UpdateSpellUsable && event.ability.guid === spell.id) {
        return event;
      } else {
        return state;
      }
    },
    validate: (state, event) =>
      state === null ||
      state.chargesAvailable === charges ||
      (state.chargesAvailable === charges - 1 && cooldownEnd(state) <= event.timestamp + 100),
    describe: (tense) => (
      <>
        <SpellLink id={spell.id} /> {tenseAlt(tense, 'has', 'had')} {charges} charges
      </>
    ),
  };
}
