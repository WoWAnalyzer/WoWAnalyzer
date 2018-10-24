import EventsNormalizer from 'parser/core/EventsNormalizer';
import SPELLS from 'common/SPELLS';

class ReincarnationNormalizer extends EventsNormalizer {

  fabricatedEvent = null;

  normalize(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {


      if (event.type === 'cast' && event.ability.guid === SPELLS.REINCARNATION.id) {
            this.fabricatedEvent = {
              timestamp: event.timestamp,
              type: "resurrect",
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
