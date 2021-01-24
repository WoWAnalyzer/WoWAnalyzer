import EventsNormalizer from 'parser/core/EventsNormalizer';
import SPELLS from 'common/SPELLS';
import { AnyEvent, EventType, HealEvent } from 'parser/core/Events';

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
      if (event.type === EventType.Heal && event.ability.guid === SPELLS.RIPTIDE.id && !event.tick) {
        healEvent = event;
        return;
      }

      if (healEvent !== null) {
        if (event.type === EventType.ApplyBuff && event.ability.guid === SPELLS.RIPTIDE.id && event.targetID === healEvent.targetID) {
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
