
import SPELLS from 'common/SPELLS';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { AnyEvent, EventType } from 'parser/core/Events';

const ARCANE_CHARGE_SPELLS = [
  SPELLS.ARCANE_BLAST,
  SPELLS.ARCANE_EXPLOSION,
  SPELLS.TOUCH_OF_THE_MAGI,
  SPELLS.ARTIFICE_OF_THE_ARCHMAGE,
];

class ArcaneCharges extends EventsNormalizer {

  /** Ensures that the Energize events to give the player Arcane Charges is always after the Cast event if they happen at the same time.
   * This is primarily because when the cast completes it calculates damage based on the charges the player had when the spell completed,
   * not including the one that they just gained (even though they happen at the same timestamp). Therefore the energize needs to happen
   * after the cast and not before it.
   */
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    events.forEach((event, eventIndex) => {
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
