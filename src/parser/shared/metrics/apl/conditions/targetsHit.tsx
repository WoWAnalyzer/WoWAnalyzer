import type Spell from 'common/SPELLS/Spell';
import { HasAbility, HasTarget, EventType, GetRelatedEvents } from 'parser/core/Events';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import { encodeFriendlyEventTargetString } from 'parser/shared/modules/Entities';
import { tenseAlt, Condition } from '../index';
import { Range, formatRange } from './index';

export interface Options {
  lookahead: number;
  targetType: EventType;
  targetSpell: Spell;
  /**
   * Use a link relation to get the target count. See `EventLinkNormalizer` for details.
   *
   * Takes precedence over other options.
   */
  targetLinkRelation: string;
}

/**
 * Condition that is valid when the spell hits multiple targets.
 *
 * The `options` parameter allows you to control how long in the future to look
 * for (usually damage) events, the type of event that is counted, and the spell
 * that is used on those events (which may be different from the spell being
 * cast).
 *
 * This condition is purely positive---it will never flag a spell as incorrect
 * because it *could have* hit multiple targets. In practice, we can't know if
 * it *would have* hit multiple targets from the log data so the condition only
 * triggers when it actually does hit the correct number of targets. In that
 * sense it is like it is always wrapped in an `optional`.
 *
 * This condition uses the `lookahead` system which comes with performance
 * penalties. Don't overuse it or set super long `lookahead` times---if you do
 * then load times will suffer.
 **/
export default function targetsHit(range: Range, options?: Partial<Options>): Condition<void> {
  const {
    lookahead,
    targetType: type,
    targetSpell,
    targetLinkRelation,
  } = {
    lookahead: 100,
    targetType: EventType.Damage,
    ...options,
  };

  return {
    key: `targets-hit-${range.atLeast}-${range.atMost}-${lookahead}-${type}-${
      targetSpell?.id || 'default'
    }`,
    lookahead: targetLinkRelation ? undefined : lookahead,
    init: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    update: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    validate: (_state, event, spell, lookahead) => {
      if (event.ability.guid !== spell.id) {
        return false;
      }
      const targets = new Set();

      if (targetLinkRelation) {
        const events = GetRelatedEvents(event, targetLinkRelation);
        for (const event of events) {
          targets.add(encodeEventTargetString(event));
        }
      } else {
        const targetSpellId = targetSpell ? targetSpell.id : spell.id;
        for (const fwdEvent of lookahead) {
          if (
            fwdEvent.type === type &&
            HasAbility(fwdEvent) &&
            HasTarget(fwdEvent) &&
            fwdEvent.ability.guid === targetSpellId
          ) {
            if (!fwdEvent.targetIsFriendly) {
              targets.add(encodeEventTargetString(fwdEvent));
            } else {
              targets.add(encodeFriendlyEventTargetString(fwdEvent));
            }
          }
        }
      }

      return (
        targets.size >= (range.atLeast || 0) && (!range.atMost || targets.size <= range.atMost)
      );
    },
    describe: (tense) => `it ${tenseAlt(tense, 'would', 'will')} hit ${formatRange(range)} targets`,
  };
}
