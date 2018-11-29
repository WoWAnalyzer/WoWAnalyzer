import EventsNormalizer from 'parser/core/EventsNormalizer';

export const END_EVENT_TYPE = 'fightend';

/**
 * Normalizes in an event at the back of the queue to indicate that the fight
 * has completed and parsing will end. By subscribing to this event you can
 * ensure that pending analyzer logic completes cleanly.
 */
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
