import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';
import { Condition, tenseAlt } from '../index';
import { formatTimestampRange, Range } from './util';
import { TrackedBuffEvent } from 'parser/core/Entity';

type BuffInformation = {
  buffs: TrackedBuffEvent[];
  nextBuff: number | undefined;
  currentIndex: number;
};

type SourceOptions = 'player' | 'external' | 'any';

export function buffSoonPresent(
  spell: Spell,
  range: Range,
  /** Set to configure the source of the buff */
  source: SourceOptions = 'player',
): Condition<BuffInformation> {
  return {
    key: `buffSoonPresent-${spell.id}-${range.atLeast}-${range.atMost}-${source}`,
    init: ({ combatant }) => {
      const buffs = combatant?.buffs
        ? combatant.buffs.filter(
            (buff) =>
              buff.ability.guid === spell.id && isValidSource(source, combatant.id, buff.sourceID),
          )
        : [];

      return {
        buffs,
        nextBuff: buffs[0]?.timestamp,
        currentIndex: 0,
      };
    },
    update: (state, event) => {
      if (event.type !== EventType.ApplyBuff || event.ability.guid !== spell.id) {
        return state;
      }

      state.currentIndex += 1;
      state.nextBuff = state.buffs[state.currentIndex]?.timestamp;

      return state;
    },
    validate: (state, event) => {
      /** No more buffs or no buffs found.
       * We will assume no more buffs will come so only atLeast can be true */
      if (!state.nextBuff) {
        return Boolean(!range.atMost && range.atLeast);
      }

      const timeTillNextBuff = state.nextBuff - event.timestamp;
      return (
        timeTillNextBuff >= (range.atLeast || 0) &&
        (!range.atMost || timeTillNextBuff <= range.atMost)
      );
    },
    describe: (tense) => (
      <>
        there {tenseAlt(tense, 'is', 'was')} {formatTimestampRange(range)} seconds remaining before{' '}
        <SpellLink spell={spell.id} /> {tenseAlt(tense, 'is', 'was')} present
      </>
    ),
  };
}

function isValidSource(source: SourceOptions, playerId: number, buffSourceId?: number): boolean {
  switch (source) {
    case 'any':
      return true;
    case 'player':
      return buffSourceId === playerId;
    case 'external':
      return buffSourceId !== playerId;
    default:
      return false;
  }
}
