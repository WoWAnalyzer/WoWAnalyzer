import SPELLS from 'common/SPELLS';

import EventsNormalizer from 'Parser/Core/EventsNormalizer';

class Scorch extends EventsNormalizer {
  /**
   * @param {Array} events
   * @returns {Array}
   */
  //Because Scorch has no travel time, ensures that the Scorch Damage event happens after Hot Streak is removed so the Scorch doesnt count as a direct damage crit during Hot Streak
  normalize(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      if (event.type === 'removebuff' && event.ability.guid === SPELLS.HOT_STREAK.id) {
        const castTimestamp = event.timestamp;

        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > 50) {
            break;
          }
          if (previousEvent.type === 'damage' && previousEvent.ability.guid === SPELLS.SCORCH.id && previousEvent.sourceID === event.sourceID) {
            fixedEvents.splice(previousEventIndex, 1);
            fixedEvents.push(previousEvent);
            previousEvent.__modified = true;
            break;
          }
        }
      }
    });

    return fixedEvents;
  }
}

export default Scorch;
