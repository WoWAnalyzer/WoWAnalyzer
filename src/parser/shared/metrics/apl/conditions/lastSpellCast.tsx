import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';
import React from 'react';

import { Condition } from '../index';

export function lastSpellCast(spell: Spell): Condition<boolean> {
  return {
    key: `lastSpellCast-${spell.id}`,
    init: () => false,
    update: (_state, event) => {
      if (event.type === EventType.Cast) {
        console.log('last spell cast', spell, 'and state was', _state);
      }
      if (event.type === EventType.Cast && event.ability.guid === spell.id) {
        return true;
      } else {
        return false;
      }
    },
    validate: (state) => state,
    describe: () => (
      <>
        your last spell cast was <SpellLink id={spell.id} />
      </>
    ),
  };
}
