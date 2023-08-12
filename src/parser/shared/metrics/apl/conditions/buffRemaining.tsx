import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import {
  ApplyBuffEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  ApplyBuffStackEvent,
  EventType,
} from 'parser/core/Events';
import { Condition, tenseAlt } from '../index';
import { formatTimestampRange, Range } from './util';

export default function buffRemaining(
  spell: Spell,
  buffDuration: number,
  range: Range,
  //If true, then if the buff is missing it will be considered valid if only atMost is specified
  missingCanBeValid: boolean = false,
): Condition<ApplyBuffEvent | RefreshBuffEvent | RemoveBuffEvent | ApplyBuffStackEvent | null> {
  return {
    key: `buffRemaining-${spell.id}`,
    init: () => null,
    update: (state, event) => {
      if (event.type === EventType.ApplyBuff && event.ability.guid === spell.id) {
        return event;
      } else if (event.type === EventType.RefreshBuff && event.ability.guid === spell.id) {
        return event;
      } else if (event.type === EventType.RemoveBuff && event.ability.guid === spell.id) {
        return null;
      } else if (event.type === EventType.ApplyBuffStack && event.ability.guid === spell.id) {
        return event;
      } else {
        return state;
      }
    },
    validate: (state, event) => {
      if (state === null) {
        //Buff is not applied so buff has no remaining time so only atMost can be true
        return Boolean(missingCanBeValid && range.atMost && !range.atLeast);
      }
      const timeRemaining = state.timestamp + buffDuration - event.timestamp;
      return (
        timeRemaining >= (range.atLeast || 0) && (!range.atMost || timeRemaining <= range.atMost)
      );
    },
    describe: (tense) => (
      <>
        <SpellLink spell={spell.id} /> {tenseAlt(tense, 'has', 'had')} {formatTimestampRange(range)}{' '}
        seconds remaining
      </>
    ),
  };
}
