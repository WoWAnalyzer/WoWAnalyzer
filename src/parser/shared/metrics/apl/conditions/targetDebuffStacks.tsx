import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType } from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/Enemies';

import { Condition, tenseAlt } from '../index';
import { Range, formatRange } from './index';
import { getTargets, TargetOptions } from './debuffMissing';

interface TargetDebuffStackState {
  playerId: number;
  stacks: Record<string, number>;
}

/**
 * Checks debuff stacks on the target of the triggering cast.
 *
 * Unlike `debuffStacks`, this condition keeps independent state for every
 * target (including target instances). When the triggering event has no
 * trustworthy target, the condition returns `fallback` instead of guessing.
 */
export default function targetDebuffStacks(
  spell: Spell,
  range: Range,
  targetOptions?: TargetOptions,
  fallback = false,
): Condition<TargetDebuffStackState> {
  return {
    key: `targetDebuffStacks-${spell.id}-${range.atLeast ?? ''}-${range.atMost ?? ''}-${targetOptions?.targetLinkRelation ?? ''}-${fallback}`,
    init: (info) => ({ playerId: info.playerId, stacks: {} }),
    update: (state, event) => {
      if (
        !('ability' in event) ||
        event.ability.guid !== spell.id ||
        !('targetID' in event) ||
        typeof event.targetID !== 'number' ||
        !('sourceID' in event) ||
        event.sourceID !== state.playerId
      ) {
        return state;
      }

      const target = encodeTargetString(
        event.targetID,
        'targetInstance' in event ? event.targetInstance : undefined,
      );
      switch (event.type) {
        case EventType.ApplyDebuff:
          return { ...state, stacks: { ...state.stacks, [target]: 1 } };
        case EventType.ApplyDebuffStack:
        case EventType.RemoveDebuffStack:
          return { ...state, stacks: { ...state.stacks, [target]: event.stack } };
        case EventType.ChangeDebuffStack:
          return { ...state, stacks: { ...state.stacks, [target]: event.newStacks } };
        case EventType.RemoveDebuff: {
          const stacks = { ...state.stacks };
          delete stacks[target];
          return { ...state, stacks };
        }
        default:
          return state;
      }
    },
    validate: (state, event) => {
      const targets = getTargets(event, targetOptions?.targetLinkRelation);
      if (targets.length === 0) {
        return fallback;
      }

      return targets.some((target) => {
        const stacks = state.stacks[target] ?? 0;
        return (
          stacks >= (range.atLeast ?? 0) && (range.atMost === undefined || stacks <= range.atMost)
        );
      });
    },
    describe: (tense) => (
      <>
        the target {tenseAlt(tense, 'has', 'had')} {formatRange(range)}{' '}
        <SpellLink spell={spell.id} icon /> stacks
      </>
    ),
  };
}
