import EventsNormalizer from 'Parser/Core/EventsNormalizer';

import SPELLS from 'common/SPELLS';

// sometimes in the event list, the Estel buff gets applied again before it's removed
// which makes parsing the value from the buff difficult. This normalizer rearranges 
// the apply buffs so they are always after the remove buff.
class EstelNormalizer extends EventsNormalizer {

  normalize(events) {

    const fixedEvents = [];
    const _pendingBuffEvents = [];

    let haveOpenBuff = false;

    events.forEach((event, eventIndex) => {

      if (event.ability && event.ability.guid
          && (event.sourceID === event.targetID) 
          && (event.ability.guid === SPELLS.ESTEL_DEJAHNAS_INSPIRATION_BUFF.id)) {

        if (haveOpenBuff) {
          // if we already have an applied buff; we get another one so push it down the line.
          if ((event.type) === "applybuff") {
            _pendingBuffEvents.push(event);
          } else if ((event.type === "removebuff") && (_pendingBuffEvents.length > 0)) {   
            fixedEvents.push(event);
            // now that we have removed the buff, we can re-add the oldest pending buff event
            const oldestBuffEvent = _pendingBuffEvents.splice(0, 1)[0];
            fixedEvents.push(oldestBuffEvent);
            oldestBuffEvent.__modified = true;
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
