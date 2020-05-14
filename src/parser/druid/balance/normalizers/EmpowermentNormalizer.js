import SPELLS from 'common/SPELLS';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { EventType } from 'parser/core/Events';

const CAST_WINDOW = 100;

/**
 * Abstract class used by Solar Empowerment and Lunar Empowerment.
 * Always place the empowerment buff after the Starsurge cast that generated them in the combatlog.
 *
 * @param {Array} events
 * @returns {Array} Events possibly with some reordered.
 */
class EmpowermentNormalizer extends EventsNormalizer {

  empowermentBuff = null;

  normalize(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
    fixedEvents.push(event);

    // find a cast event for Starsurge
    if(event.type === EventType.Cast && event.ability.guid === SPELLS.STARSURGE_MOONKIN.id) {
      const castTimestamp = event.timestamp;

      // look for matching recent applybuff or applybuffstack
      for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
        const previousEvent = fixedEvents[previousEventIndex];
        if ((castTimestamp - previousEvent.timestamp) > CAST_WINDOW) {
          break;
        }
        if ((previousEvent.type === EventType.ApplyBuff || previousEvent.type === EventType.ApplyBuffStack) &&
            previousEvent.ability.guid === this.empowermentBuff.id) {
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

export default EmpowermentNormalizer;
