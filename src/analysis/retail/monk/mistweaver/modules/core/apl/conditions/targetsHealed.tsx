import type Spell from 'common/SPELLS/Spell';
import { EventType, GetRelatedEvents, CastEvent } from 'parser/core/Events';
import { Condition, tenseAlt } from 'parser/shared/metrics/apl';
import { Range, formatRange } from 'parser/shared/metrics/apl/conditions';

export interface Options {
  targetType: EventType;
  targetSpell: Spell;
}

/**
 * Condition that is valid when a heal hits multiple targets.
 *
 * THIS REQUIRES THAT YOU HAVE PROPERLY SET UP EVENT LINKS
 * in the EventLinkNormalizer for the spell you want using this condition
 *
 * This condition is purely positive---it will never flag a spell as incorrect
 * because it *could have* hit multiple targets. In practice, we can't know if
 * it *would have* hit multiple targets from the log data so the condition only
 * triggers when it actually does hit the correct number of targets. In that
 * sense it is like it is always wrapped in an `optional`.
 *
 **/
export default function targetsHealed(range: Range, options?: Partial<Options>): Condition<void> {
  const { targetType: type, targetSpell } = {
    targetType: EventType.Heal,
    ...options,
  };

  return {
    key: `targets-healed-${range.atLeast}-${range.atMost}-${type}-${targetSpell?.id || 'default'}`,
    init: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    update: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    validate: (_state, event, spell, lookahead) => {
      if (event.ability.guid !== spell.id) {
        return false;
      }
      const targets = new Set();
      const targetSpellId = targetSpell ? targetSpell.id : spell.id;
      let related = GetRelatedEvents(event as CastEvent, event.ability.name);
      if (
        related?.length === 0 &&
        event.type === EventType.BeginChannel &&
        event.trigger?.type === EventType.BeginCast &&
        event.trigger.castEvent
      ) {
        related = GetRelatedEvents(event.trigger.castEvent, event.ability.name);
      }
      if (event.ability.guid === targetSpellId && related.length > 0) {
        for (const linkedEvent of related) {
          targets.add(linkedEvent);
        }
      }
      return (
        targets.size >= (range.atLeast || 0) && (!range.atMost || targets.size <= range.atMost)
      );
    },
    describe: (tense) => `it ${tenseAlt(tense, 'would', 'will')} hit ${formatRange(range)} targets`,
  };
}
