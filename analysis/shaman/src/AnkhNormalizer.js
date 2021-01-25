import EventsNormalizer from 'parser/core/EventsNormalizer';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

class ReincarnationNormalizer extends EventsNormalizer {

  fabricatedEvent = null;

  normalize(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {


      if (event.type === EventType.Cast && event.ability.guid === SPELLS.REINCARNATION.id) {
            this.fabricatedEvent = {
              timestamp: event.timestamp,
              type: EventType.Resurrect,
              sourceID: event.sourceID,
              targetID: event.sourceID,
              sourceIsFriendly: true,
              targetIsFriendly: true,
              ability: SPELLS.REINCARNATION,
              __fabricated: true,
            };
        fixedEvents.push(this.fabricatedEvent);
      }
      fixedEvents.push(event);
    });
    return fixedEvents;
  }

}
export default ReincarnationNormalizer;
