import SPELLS from 'common/SPELLS';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

/**
 * Sometimes the game generates duplicate cast events, 1 for cast spell id
 * and the other for heal/damage id. This normalizer deletes the heal/damage id and keeps the cast id event.
 */
class LivingFlameNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    events.forEach((event, eventIndex) => {
      if (
        event.type !== EventType.Cast ||
        (event.ability.guid !== SPELLS.LIVING_FLAME_HEAL.id &&
          event.ability.guid !== SPELLS.LIVING_FLAME_DAMAGE.id)
      ) {
        fixedEvents.push(event);
      }
    });
    return fixedEvents;
  }
}
export default LivingFlameNormalizer;
