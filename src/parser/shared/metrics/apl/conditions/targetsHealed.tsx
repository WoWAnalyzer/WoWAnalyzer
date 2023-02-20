import type Spell from 'common/SPELLS/Spell';
import { HasAbility, HasTarget, EventType, HasSource, GetRelatedEvents, CastEvent } from 'parser/core/Events';
import { encodeFriendlyEventTargetString } from 'parser/shared/modules/Entities';
import { tenseAlt, Condition } from '../index';
import { Range, formatRange } from './index';
export interface Options {
  lookahead: number;
  targetType: EventType;
  targetSpell: Spell;
}

/**
 * Condition that is valid when a heal hits multiple targets.
 *
 * The `options` parameter allows you to control how long in the future to look
 * for events, but it is only used as a backup to not having an EventLinkNormalizer 
 * for the spell you want using this condition
 *
 * This condition is purely positive---it will never flag a spell as incorrect
 * because it *could have* hit multiple targets. In practice, we can't know if
 * it *would have* hit multiple targets from the log data so the condition only
 * triggers when it actually does hit the correct number of targets. In that
 * sense it is like it is always wrapped in an `optional`.
 *
 * This condition can use the `lookahead` system which comes with performance
 * penalties. Set up event linking if possible, if not, don't overuse it or set 
 * super long `lookahead` times---if you do then load times will suffer.
 **/
export default function targetsHealed(range: Range, options?: Partial<Options>): Condition<void> {
  const {
    lookahead,
    targetType: type,
    targetSpell,
  } = {
    lookahead: 250,
    targetType: EventType.Heal,
    ...options,
  };

  return {
    key: `targets-healed-${range.atLeast}-${range.atMost}-${lookahead}-${type}-${
      targetSpell?.id || 'default'
    }`,
    lookahead,
    init: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    update: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    validate: (_state, event, spell, lookahead) => {
      if (event.ability.guid !== spell.id) {
        return false;
      }
      const targets = new Set();
      const targetSpellId = targetSpell ? targetSpell.id : spell.id;
      const related =  GetRelatedEvents(event as CastEvent, event.ability.name);
      if(event.ability.guid === targetSpellId && related?.length>0) {
        for(const linkedEvent of related) {
            targets.add(linkedEvent);
        }
      }
      else{
        for (const fwdEvent of lookahead) {
          if (
            fwdEvent.type === EventType.Heal &&
            HasAbility(fwdEvent) &&
            (HasTarget(fwdEvent) || HasSource(fwdEvent)) &&
            fwdEvent.ability.guid === targetSpellId
          ) {
              targets.add(encodeFriendlyEventTargetString(fwdEvent));
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
