import SPELLS from 'common/SPELLS';

import EventsNormalizer from 'parser/core/EventsNormalizer';
import { AnyEvent, EventType } from 'parser/core/Events';

class RuneOfPowerNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      if (event.type === EventType.RemoveBuff && event.ability.guid === SPELLS.RUNE_OF_POWER_BUFF.id) {
        const castTimestamp = event.timestamp;
        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if (previousEvent && (castTimestamp - previousEvent.timestamp) > 100) {
            break;
          }
          if (previousEvent && (previousEvent.type === EventType.ApplyBuff || previousEvent.type === EventType.Cast) && previousEvent.ability.guid === SPELLS.RUNE_OF_POWER_BUFF.id) {
            fixedEvents.splice(previousEventIndex, 1);
            previousEvent.__modified = true;
          }
          if (previousEvent && previousEvent.type === EventType.RemoveBuff && previousEvent.timestamp !== castTimestamp && previousEvent.ability.guid === SPELLS.RUNE_OF_POWER_BUFF.id) {
            fixedEvents.splice(previousEventIndex, 1);
            previousEvent.__modified = true;
          }
        }
      } else if (event.type === EventType.Cast && event.ability.guid === SPELLS.RUNE_OF_POWER_BUFF.id) {
        const castTimestamp = event.timestamp;

        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if (previousEvent && (castTimestamp - previousEvent.timestamp) > 50) {
            break;
          }
          if (previousEvent && previousEvent.type === EventType.ApplyBuff && previousEvent.ability.guid === SPELLS.RUNE_OF_POWER_BUFF.id && previousEvent.sourceID === event.sourceID) {
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

export default RuneOfPowerNormalizer;
