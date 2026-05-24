import TALENTS from 'common/TALENTS/evoker';
import { AnyEvent, EventType, HasRelatedEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import CastLinkNormalizer, { INVALID_DRAGONRAGE_REMOVE } from './CastLinkNormalizer';

/** This Normalizer fixes an issue that happens very sporadically, where Dragonrage gets removed and reapplied on the same tick.
 * This is has no effect on actual gameplay and will just mess up the analyzers (Likely some hallucination by the log).
 * As a remedy we just remove both events.
 * */

class DragonrageNormalizer extends EventsNormalizer {
  static dependencies = {
    ...EventsNormalizer.dependencies,
    castLinkNormalizer: CastLinkNormalizer,
  };
  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    events.forEach((event: AnyEvent) => {
      if (
        (event.type !== EventType.RemoveBuff && event.type !== EventType.ApplyBuff) ||
        event.ability.guid !== TALENTS.DRAGONRAGE_TALENT.id ||
        !HasRelatedEvent(event, INVALID_DRAGONRAGE_REMOVE)
      ) {
        fixedEvents.push(event);
      }
    });
    return fixedEvents;
  }
}

export default DragonrageNormalizer;
