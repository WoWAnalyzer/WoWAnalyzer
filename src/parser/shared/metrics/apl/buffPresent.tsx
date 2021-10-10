import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';
import React from 'react';

import type { Condition } from './index';

export function buffPresent(spell: Spell): Condition<boolean> {
  return {
    key: `buffPresent-${spell.id}`,
    init: () => false,
    update: (state, event) => {
      switch (event.type) {
        case EventType.ApplyBuff:
          if (event.ability.guid === spell.id) {
            return true;
          }
          break;
        case EventType.RemoveBuff:
          if (event.ability.guid === spell.id) {
            return false;
          }
          break;
      }

      return state;
    },
    validate: (state, _event) => state,
    describe: () => (
      <>
        <SpellLink id={spell.id} /> was present
      </>
    ),
  };
}

export function buffMissing(spell: Spell): Condition<boolean> {
  return {
    ...buffPresent(spell),
    key: `buffMissing-${spell.id}`,
    validate: (state, _event) => !state,
    describe: () => (
      <>
        <SpellLink id={spell.id} /> was missing
      </>
    ),
  };
}
