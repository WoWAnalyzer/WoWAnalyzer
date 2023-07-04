import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { UpdateSpellUsableEvent, EventType } from 'parser/core/Events';

import { Condition, tenseAlt } from '../index';
import { formatTimestampRange, Range } from './util';

export default function spellCooldownRemaining(
  spell: Spell,
  range: Range,
): Condition<UpdateSpellUsableEvent | null> {
  return {
    key: `spellCooldownRemaning-${spell.id}`,
    init: () => null,
    update: (state, event) => {
      if (event.type === EventType.UpdateSpellUsable && event.ability.guid === spell.id) {
        return event;
      } else {
        return state;
      }
    },
    validate: (state, event) => {
      if (state === null) {
        //spell hasn't been cast yet, so it can't have any cooldown remaining so only atMost can be true
        return Boolean(range.atMost && !range.atLeast);
      }
      const cdRemaining = state.expectedRechargeTimestamp - event.timestamp;
      return cdRemaining >= (range.atLeast || 0) && (!range.atMost || cdRemaining <= range.atMost);
    },
    describe: (tense) => (
      <>
        <SpellLink spell={spell.id} /> {tenseAlt(tense, 'has', 'had')} {formatTimestampRange(range)}{' '}
        seconds remaining on cooldown
      </>
    ),
  };
}
