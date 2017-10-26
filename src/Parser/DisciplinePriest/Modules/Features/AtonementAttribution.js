import Module from 'Parser/Core/Module';
import isAtonement from '../Core/isAtonement';

class AtonementAttribution extends Module {

  /**
   *  This modules serves as a correction to the ordering in logs
   *  Currently in wlogs, atonement is handled by associating all the
   *  healing to the last damaging events. This breaks when damaging events
   *  happen simultaneously since it will associate the atonement of both
   *  events to the last event that occured.
   * @param {Array} events
   * @returns {Array}
   */
  reorderEvents(events) {
    let fixedEvents = [];
    let _encounteredTargetIDs = [];
    let _damageEventIndexes = [];

    events.forEach((event, eventIndex) => {

      fixedEvents.push(event);

      if(event.type == "damage" && event.sourceIsFriendly){
        _damageEventIndexes.push(eventIndex);
        _encounteredTargetIDs = [];
        return;
      }

      if(event.type == "heal" && isAtonement(event)) {

        // We encountered a targetID we already encountered since the last damage
        // event. We push down the last damage event here
        if(_encounteredTargetIDs.indexOf(event.targetID) >= 0) {
          let lastDamageEvent = fixedEvents.splice(_damageEventIndexes[_damageEventIndexes.length -1], 1)[0];
          fixedEvents.splice(fixedEvents.length - 1, 0, lastDamageEvent);
          _encounteredTargetIDs = [];
          return;
        }

        //  We ignore atonement on self in the handling of repeating targetIDs
        //  Because of latency issues
        if(event.sourceID !== event.targetID)
          _encounteredTargetIDs.push(event.targetID);
      }

    });

    return fixedEvents;
  }
}

export default AtonementAttribution;
