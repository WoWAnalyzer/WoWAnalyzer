import SPELLS from 'common/SPELLS';

import EventsNormalizer from 'Parser/Core/EventsNormalizer';

import isAtonement from '../Modules/Core/isAtonement';

class AtonementSuccessiveDamage extends EventsNormalizer {

  normalize(events) {
    let fixedEvents = [];
    let _encounteredTargetIDs = [];
    let _damageEventIndexes = [];

    let _lastEventWasDamage = false;
    let _lastEventDamageIndexes = [];

    console.log(events.slice());

    events.forEach((event, eventIndex) => {

      fixedEvents.push(event);

      if(event.type == "damage" && event.sourceIsFriendly && !event.targetIsFriendly){
        _damageEventIndexes.push(eventIndex);
        _encounteredTargetIDs = [];

        if(_lastEventWasDamage){
          _lastEventDamageIndexes.push(eventIndex);
        }else{
          _lastEventDamageIndexes = [];
        }

        _lastEventWasDamage = true;
        return;
      }

      if(event.type == "heal" && isAtonement(event)) {

        // We encountered a targetID we already encountered since the last damage
        // event. We push down the last damage event here
        if(_encounteredTargetIDs.indexOf(event.targetID) >= 0) {

          console.log("Will move from: " + _damageEventIndexes[_damageEventIndexes.length -1]);
          console.log("to: " + (fixedEvents.length - 1))
          console.log(_lastEventDamageIndexes)
          let lastDamageEvent = fixedEvents.splice(_damageEventIndexes[_damageEventIndexes.length -1], 1)[0];
          fixedEvents.splice(fixedEvents.length - 1, 0, lastDamageEvent);
          _encounteredTargetIDs = [];
          return;
        }

        //  We ignore atonement on self in the handling of repeating targetIDs
        //  Because of latency issues
        if(event.sourceID !== event.targetID) {
          _lastEventWasDamage = false;
          _encounteredTargetIDs.push(event.targetID);
        }
      }

    });

    console.log(fixedEvents);

    return fixedEvents;


  }
}
export default AtonementSuccessiveDamage;
