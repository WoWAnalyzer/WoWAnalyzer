import { AnyEvent, EventType, HealEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import TALENTS from 'common/TALENTS/shaman';

/**
 * reordering riptide applybuff after the initial heal because i really need it this way around
 * for the primaltidecore legendary analysis
 * todo: fix cast event as well?
 */

class RiptideNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    let healEvent: HealEvent | null = null;

    events.forEach((event: AnyEvent, eventIndex) => {
      if (
        event.type === EventType.Heal &&
        event.ability.guid === TALENTS.RIPTIDE_TALENT.id &&
        !event.tick
      ) {
        healEvent = event;
        return;
      }

      if (healEvent !== null) {
        if (
          event.type === EventType.ApplyBuff &&
          event.ability.guid === TALENTS.RIPTIDE_TALENT.id &&
          event.targetID === healEvent.targetID
        ) {
          healEvent.__reordered = true;
          healEvent.__modified = true;
          healEvent.timestamp = event.timestamp;
          fixedEvents.push(event);
          fixedEvents.push(healEvent);
          healEvent = null;
          return;
        } else {
          fixedEvents.push(healEvent);
          fixedEvents.push(event);
          healEvent = null;
          return;
        }
      }

      fixedEvents.push(event);
    });

    return fixedEvents;
  }
}
export default RiptideNormalizer;
