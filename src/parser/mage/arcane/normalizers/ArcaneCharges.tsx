
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { EventType } from 'parser/core/Events';
import { ARCANE_CHARGE_SPELLS } from '../constants';

class ArcaneCharges extends EventsNormalizer {

    /** Ensures that the Energize events to give the player Arcane Charges is always after the Cast event if they happen at the same time.
    * This is primarily because when the cast completes it calculates damage based on the charges the player had when the spell completed,
    * not including the one that they just gained (even though they happen at the same timestamp). Therefore the energize needs to happen
    * after the cast and not before it.
    */

  normalize(events: any) {
    const fixedEvents: any = [];
    events.forEach((event: any, eventIndex: any) => {
      fixedEvents.push(event);

      if (event.type === EventType.Cast && ARCANE_CHARGE_SPELLS.includes(event.ability)) {
        const castTimestamp = event.timestamp;

        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > 50) {
            break;
          }
          if (previousEvent.type === EventType.Energize && previousEvent.sourceID === event.sourceID) {
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

export default ArcaneCharges;
