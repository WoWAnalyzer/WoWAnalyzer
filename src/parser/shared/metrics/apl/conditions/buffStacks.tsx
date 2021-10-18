import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';
import React from 'react';

import { Condition, tenseAlt } from '../index';

export function moreThanBuffStacks(spell: Spell, stack: number): Condition<boolean> {
  return {
    key: `buffPresent-${spell.id}`,
    init: () => false,
    update: (state, event) => {
      switch (event.type) {
        case EventType.ApplyBuffStack:
          if (event.ability.guid === spell.id && event.stack > stack) {
            return true;
          }
          break;
        case EventType.RemoveBuffStack:
          if (event.ability.guid === spell.id && event.stack <= stack) {
            return false;
          }
          break;
      }

      return state;
    },
    validate: (state, _event) => state,
    describe: (tense) => (
      <>
        more than {stack} stacks of <SpellLink id={spell.id} /> {tenseAlt(tense, 'is', 'was')}{' '}
        present
      </>
    ),
  };
}

export function lessThanBuffStacks(spell: Spell, stack: number): Condition<boolean> {
  return {
    key: `buffPresent-${spell.id}`,
    init: () => false,
    update: (state, event) => {
      switch (event.type) {
        case EventType.ApplyBuffStack:
          if (event.ability.guid === spell.id && event.stack < stack) {
            return true;
          }
          break;
        case EventType.RemoveBuffStack:
          if (event.ability.guid === spell.id && event.stack >= stack) {
            return false;
          }
          break;
      }

      return state;
    },
    validate: (state, _event) => state,
    describe: (tense) => (
      <>
        less than {stack} stacks of <SpellLink id={spell.id} /> {tenseAlt(tense, 'is', 'was')}{' '}
        present
      </>
    ),
  };
}
