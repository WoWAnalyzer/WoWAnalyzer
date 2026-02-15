import SPELLS from 'common/SPELLS/evoker';
import { AddRelatedEvent, AnyEvent, CastEvent, EventType, HasAbility } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { Options } from 'parser/core/Module';

export const CHAINED_FROM_CAST = 'ChainedFromCast';
export const CHAINED_CAST = 'ChainedCast';

/**
 * A core aspect of Devastation gameplay is the ability to chain Disintegrate casts, carrying over ticks through pandemic.
 *
 * Some modifiers carry over for the chained tick, but not all.
 * So we want to be able to link the chained casts together so we can later get the correct ticks for analysis.
 *
 * Using a normal CastLinkNormalizer for this is not really ideal, so we'll use this instead.
 */
class DisintegrateChainCastLinks extends EventsNormalizer {
  constructor(options: Options) {
    super(options);
  }

  normalize(events: AnyEvent[]) {
    let currentDisintegrateCast: CastEvent | undefined;
    let activeDebuffs = 0;

    for (const event of events) {
      if (!HasAbility(event) || event.ability.guid !== SPELLS.DISINTEGRATE.id) {
        continue;
      }

      if (event.type === EventType.Cast) {
        if (activeDebuffs > 0 && currentDisintegrateCast) {
          AddRelatedEvent(currentDisintegrateCast, CHAINED_CAST, event);
          AddRelatedEvent(event, CHAINED_FROM_CAST, currentDisintegrateCast);
        }

        currentDisintegrateCast = event;
        continue;
      }

      if (event.type === EventType.ApplyDebuff) {
        activeDebuffs += 1;
      }

      if (event.type === EventType.RemoveDebuff) {
        activeDebuffs -= 1;
      }
    }

    return events;
  }
}

export default DisintegrateChainCastLinks;
