import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  EventType,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { Condition, tenseAlt } from '../index';
import { buffDuration, DurationData, formatTimestampRange, PandemicData, Range } from './util';

type State = DurationData & {
  previousEvent: ApplyBuffEvent | RefreshBuffEvent | ApplyBuffStackEvent | RemoveBuffEvent;
};

/**
 * Assert that a buff has remaining time within `range`.
 */
export default function buffRemaining(
  spell: Spell,
  pandemic: PandemicData,
  range: Range,
  /**
   * If true, then if the buff is missing it will be considered valid if only atMost is specified
   */
  missingCanBeValid: boolean = false,
): Condition<State | undefined> {
  return {
    key: `buffRemaining-${spell.id}`,
    init: () => undefined,
    update: (state, event) => {
      if (event.type === EventType.ApplyBuff && event.ability.guid === spell.id) {
        return {
          referenceTime: event.timestamp,
          previousEvent: event,
          timeRemaining: pandemic.duration,
        };
      } else if (
        (event.type === EventType.RefreshBuff || event.type === EventType.ApplyBuffStack) &&
        event.ability.guid === spell.id
      ) {
        // *sometimes* the game logs both a refresh and an applybuffstack at the same timestamp.
        // this bit handles not extending the buff twice when that occurs.
        if (
          state &&
          state.previousEvent.type !== event.type &&
          state.previousEvent.timestamp === event.timestamp
        ) {
          return state;
        }
        return {
          referenceTime: event.timestamp,
          previousEvent: event,
          timeRemaining: buffDuration(event.timestamp, state, pandemic),
        };
      } else if (event.type === EventType.RemoveBuff && event.ability.guid === spell.id) {
        return undefined;
      } else {
        return state;
      }
    },
    validate: (state, event) => {
      if (state === undefined) {
        //Buff is not applied so buff has no remaining time so only atMost can be true
        return Boolean(missingCanBeValid && range.atMost && !range.atLeast);
      }
      const timeRemaining = buffDuration(event.timestamp, state, pandemic);
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
