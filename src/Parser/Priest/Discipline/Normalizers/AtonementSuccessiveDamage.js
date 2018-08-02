import EventsNormalizer from 'Parser/Core/EventsNormalizer';

import isAtonement from '../Modules/Core/isAtonement';

class AtonementSuccessiveDamage extends EventsNormalizer {

  normalize(events) {

    const fixedEvents = [];
    const _damageEventIndexes = [];

    let _encounteredTargetIDs = [];

    events.forEach((event, eventIndex) => {

      fixedEvents.push(event);

      if(event.type === "damage" && event.sourceIsFriendly && !event.targetIsFriendly){
        _damageEventIndexes.push(eventIndex);
        _encounteredTargetIDs = [];
        return;
      }

      if(event.type === "heal" && isAtonement(event)) {

        // We encountered a targetID we already encountered since the last damage
        // event. We push down the last damage event here
        if(_encounteredTargetIDs.includes(event.targetID)) {
          const lastDamageEvent = fixedEvents.splice(_damageEventIndexes[_damageEventIndexes.length -1], 1)[0];
          lastDamageEvent.__modified = true;
          fixedEvents.splice(fixedEvents.length - 1, 0, lastDamageEvent);
          _encounteredTargetIDs = [];
          return;
        }

        //  We ignore atonement on self in the handling of repeating targetIDs
        //  Because of latency issues, the atonement on self does not follow
        //  the same rules normal atonement does. We will handle these cases
        //  in another normalizer
        if(event.sourceID !== event.targetID) {
          _encounteredTargetIDs.push(event.targetID);
        }
      }

    });
    return fixedEvents;
  }
}
export default AtonementSuccessiveDamage;
