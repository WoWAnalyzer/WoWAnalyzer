import EventsNormalizer from 'Parser/Core/EventsNormalizer';

import SPELLS from 'common/SPELLS';

class EstelNormalizer extends EventsNormalizer {

  normalize(events) {

    const fixedEvents = [];
    const _buffEventIndexes = [];

    events.forEach((event, eventIndex) => {

      fixedEvents.push(event);

      if ((event.sourceID === event.targetID) 
          && (event.ability.guid === SPELLS.ESTEL_DEJAHNAS_INSPIRATION_BUFF.id)
          && (event.type === "applybuff")) {
        _buffEventIndexes.push(eventIndex);
        return;
      }

      // if we haven't closed the buff-removal pair, push the new one down the line
      if ((_buffEventIndexes.length > 0) 
          && (event.sourceID === event.targetID) 
          && (event.ability.guid === SPELLS.ESTEL_DEJAHNAS_INSPIRATION_BUFF.id)
          && (event.type === "applybuff")) {
        const lastBuffEvent = fixedEvents.splice(_buffEventIndexes[_buffEventIndexes.length -1], 1)[0];
        lastBuffEvent.__modified = true;
        fixedEvents.splice(fixedEvents.length - 1, 0, lastBuffEvent);
        return;
      }

      if ((event.sourceID === event.targetID) 
          && (event.ability.guid === SPELLS.ESTEL_DEJAHNAS_INSPIRATION_BUFF.id)
          && (event.type === "removebuff")) {
        if ((_buffEventIndexes.length > 0)) {
          const e = _buffEventIndexes.splice(0, 1);
          fixedEvents.splice(fixedEvents.length - 1, 0, e)
        } else {
          // if we get a remove buff with no application.... kick it down the line?
          // fixedEvents.splice(fixedEvents.length - 1, 0, event.)
        }
        return;
      }

    });
    return fixedEvents;
  }
}
export default EstelNormalizer;
