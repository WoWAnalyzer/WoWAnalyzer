import SPELLS from 'common/SPELLS';
import type Spell from 'common/SPELLS/Spell';
import { TALENTS_MONK } from 'common/TALENTS';
import SpellLink from 'interface/SpellLink';
import { EventType, GetRelatedEvents, HasAbility, HasTarget } from 'parser/core/Events';
import { Condition, tenseAlt } from 'parser/shared/metrics/apl';
import { Range } from 'parser/shared/metrics/apl/conditions';
import { encodeFriendlyEventTargetString } from 'parser/shared/modules/Entities';

interface Options {
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
  const {
    lookahead,
    targetType: type,
    targetSpell,
    targetLinkRelation,
  } = {
    lookahead: 100,
    targetType: EventType.Heal,
    ...options,
  };

  return {
    key: `targets-healed-${range.atLeast}-${range.atMost}-${type}-${targetSpell?.id || 'default'}`,
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
        for (const linkedEvent of events) {
          targets.add(encodeFriendlyEventTargetString(linkedEvent));
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
            if (fwdEvent.targetIsFriendly) {
              targets.add(encodeFriendlyEventTargetString(fwdEvent));
            }
          }
        }
      }

      return (
        targets.size >= (range.atLeast || 0) && (!range.atMost || targets.size <= range.atMost)
      );
    },
    describe: (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} {range.atLeast} active{' '}
        <SpellLink spell={SPELLS.RENEWING_MIST_CAST} />
        s.
      </>
    ),
  };
}
