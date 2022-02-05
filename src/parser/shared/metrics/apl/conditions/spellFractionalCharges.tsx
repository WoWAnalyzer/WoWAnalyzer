import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';

import { Condition, tenseAlt } from '../index';
import { Range, formatRange } from './index';

interface State {
  chargesAvailable: number;
  expectedDuration: number;
  start: number;
}

export function spellFractionalCharges(spell: Spell, range: Range): Condition<State | null> {
  return {
    key: `spellCharges-${spell.id}`,
    init: () => null,
    update: (state, event) => {
      if (event.type === EventType.UpdateSpellUsable && event.ability.guid === spell.id) {
        return {
          chargesAvailable: event.chargesAvailable,
          expectedDuration: event.expectedDuration,
          start: event.start,
        };
      }
      return state;
    },
    validate: (state, event) => {
      if (!state) {
        //UpdateSpellUsable hasn't been called for the correct spellId so assume full charges available for use
        return true;
      }
      const fractional = (event.timestamp - state.start) / state.expectedDuration;
      const charges = state.chargesAvailable + fractional;
      return (
        charges >= (range.atLeast || 0) && (range.atMost === undefined || charges <= range.atMost)
      );
    },
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} {formatRange(range)} charges of{' '}
        <SpellLink id={spell.id} icon />
      </>
    ),
  };
}
