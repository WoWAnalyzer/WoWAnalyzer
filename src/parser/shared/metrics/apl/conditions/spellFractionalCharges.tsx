import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';

import { Condition, tenseAlt } from '../index';
import { Range, formatRange } from './index';

export function spellFractionalCharges(
  spell: Spell,
  range: Range,
): Condition<Record<string, number> | null> {
  return {
    key: `spellCharges-${spell.id}`,
    init: () => null,
    update: (state, event) => {
      if (event.type === EventType.UpdateSpellUsable && event.ability.guid === spell.id) {
        return {
          chargesAvailable: event.chargesAvailable,
          expectedDuration: event.expectedRechargeDuration,
          expectedEnd: event.expectedRechargeTimestamp,
        };
      }
      if (event.type === EventType.GlobalCooldown && event.ability.guid === spell.id && state) {
        const timeTillOffCd = state.expectedEnd - event.timestamp;
        const fractional = (state.expectedDuration - timeTillOffCd) / state.expectedDuration;
        return { ...state, chargesAvailable: state.chargesAvailable + fractional };
      }
      return state;
    },
    validate: (state, event) => {
      if (!state) {
        //UpdateSpellUsable hasn't been called for the correct spellId so assume full charges available for use
        return true;
      }
      return (
        state.chargesAvailable >= (range.atLeast || 0) &&
        (range.atMost === undefined || state.chargesAvailable <= range.atMost)
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
