import EventsNormalizer from 'parser/core/EventsNormalizer';

export const END_EVENT_TYPE = 'fightend';

class FightEnd extends EventsNormalizer {

  normalize(events) {
    const event = {
      timestamp: events[events.length - 1].timestamp,
      type: END_EVENT_TYPE,
      __fabricated: true,
    };
    events.push(event);
    return events;
  }

}

export default FightEnd;
