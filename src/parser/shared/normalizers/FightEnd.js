import EventsNormalizer from 'parser/core/EventsNormalizer';

export const END_EVENT_TYPE = 'fightend';

class FightEnd extends EventsNormalizer {

  normalize(events) {
    const event = {
      timestamp: this.owner.fight.end_time,
      type: END_EVENT_TYPE,
      __fabricated: true,
    };
    events.push(event);
    return events;
  }

}

export default FightEnd;
