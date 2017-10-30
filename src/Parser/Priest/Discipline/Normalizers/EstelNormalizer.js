import EventsNormalizer from 'Parser/Core/EventsNormalizer';

import SPELLS from 'common/SPELLS';

const MAX_DELAY = 50;

class EstelNormalizer extends EventsNormalizer {

  normalize(events) {

    const fixedEvents = [];
    const _buffEventIndexes = [];

    events.forEach((event, eventIndex) => {

      fixedEvents.push(event);

      // if ((event.sourceID === event.targetID) 
      //     && (event.ability.guid === SPELLS.ESTEL_DEJAHNAS_INSPIRATION_BUFF.id)
      //     && (event.type === "applybuff")) {
      //   _buffEventIndexes.push(eventIndex);
      //   return;
      // }

      // if we haven't closed the buff-removal pair, push the new one down the line
      if ((_buffEventIndexes.length > 0) 
          && (event.sourceID === event.targetID) 
          && (event.ability.guid === SPELLS.ESTEL_DEJAHNAS_INSPIRATION_BUFF.id)
          && (event.type === "removebuff")) {

        const castTimestamp = event.timestamp;
        
        // Loop through the event history in reverse to detect if there was buff application just before it's removal
        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > MAX_DELAY) {
            break;
          }
          if (previousEvent.type === 'applybuff' && previousEvent.ability.guid === SPELLS.ESTEL_DEJAHNAS_INSPIRATION_BUFF.id && previousEvent.sourceID === event.sourceID) {
            fixedEvents.splice(previousEventIndex, 1);
            fixedEvents.push(previousEvent);
            previousEvent.__modified = true;
            break; // I haven't seen a log with multiple `heal` events before the `cast` yet
          }
        }
      }

      // if ((event.sourceID === event.targetID) 
      //     && (event.ability.guid === SPELLS.ESTEL_DEJAHNAS_INSPIRATION_BUFF.id)
      //     && (event.type === "removebuff")) {
      //   if ((_buffEventIndexes.length > 0)) {
      //     const e = _buffEventIndexes.splice(0, 1);
      //     fixedEvents.splice(fixedEvents.length - 1, 0, e)
      //   } else {
      //     // if we get a remove buff with no application.... kick it down the line?
      //     // fixedEvents.splice(fixedEvents.length - 1, 0, event.)
      //   }
      //   return;
      // }

    });
    return fixedEvents;
  }
}
export default EstelNormalizer;
