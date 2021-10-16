import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';
import React from 'react';

import { Condition, tenseAlt } from './index';

export interface PandemicData {
  timeRemaining: number;
  duration: number;
  pandemicCap?: number;
}

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
    describe: (tense) => (
      <>
        <SpellLink id={spell.id} /> {tenseAlt(tense, 'is', 'was')} present
      </>
    ),
  };
}

interface DurationData {
  timeRemaining: number;
  referenceTime: number;
}

const buffDuration = (timeRemaining: number | undefined, pandemic: PandemicData): number =>
  Math.min(
    (timeRemaining || 0) + pandemic.duration,
    pandemic.duration * (pandemic.pandemicCap || 3),
  );

export function buffMissing(
  spell: Spell,
  optPandemic?: PandemicData,
): Condition<DurationData | null> {
  const pandemic: PandemicData = {
    timeRemaining: 0,
    duration: 0,
    ...optPandemic,
  };

  return {
    key: `buffMissing-${spell.id}`,
    init: () => null,
    update: (state, event) => {
      switch (event.type) {
        case EventType.ApplyBuff:
          if (event.ability.guid === spell.id) {
            return {
              referenceTime: event.timestamp,
              timeRemaining: buffDuration(state?.timeRemaining, pandemic),
            };
          }
          break;
        case EventType.RemoveBuff:
          if (event.ability.guid === spell.id) {
            return null;
          }
          break;
      }

      return state;
    },
    validate: (state, event) =>
      state === null ||
      state.referenceTime + state.timeRemaining < event.timestamp + pandemic.timeRemaining,
    describe: (tense) => (
      <>
        <SpellLink id={spell.id} /> {tenseAlt(tense, 'is', 'was')} missing{' '}
        {optPandemic && <>or about to expire</>}
      </>
    ),
  };
}
