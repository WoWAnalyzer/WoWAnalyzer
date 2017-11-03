import EventsNormalizer from 'Parser/Core/EventsNormalizer';

import SPELLS from 'common/SPELLS';

class EstelNormalizer extends EventsNormalizer {

  normalize(events) {

    const fixedEvents = [];
    const _pendingBuffEvents = [];

    let haveOpenBuff = false;

    events.forEach((event, eventIndex) => {

      if ((event.sourceID === event.targetID) 
          && (event.ability.guid === SPELLS.ESTEL_DEJAHNAS_INSPIRATION_BUFF.id)) {

        if (haveOpenBuff) {
          if ((event.type) === "applybuff") {
            _pendingBuffEvents.push(event);
          } else if ((event.type === "removebuff") && (_pendingBuffEvents.length > 0)) {   
            const oldestBuffEvent = _pendingBuffEvents.splice(0, 1)[0];
            fixedEvents.push(event);
            fixedEvents.push(oldestBuffEvent);
            if (_pendingBuffEvents.length === 0) {
              haveOpenBuff = false;
            } 
          } else if (event.type === "removebuff") {
            haveOpenBuff = false;
            fixedEvents.push(event);
          }
        } else {
          if ((event.type) === "applybuff") {
            haveOpenBuff = true;
            fixedEvents.push(event);
          } else if (event.type === "removebuff") {
            // I have never seen this case.
          }
        }
      } else {
        fixedEvents.push(event);
      }

    });
    return fixedEvents;
  }
}
export default EstelNormalizer;
