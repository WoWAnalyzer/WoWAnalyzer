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

    events.forEach((event, eventIndex) => {

      fixedEvents.push(event);

      if(event.type == "damage" && event.sourceIsFriendly){
        _encounteredTargetIDs = [];
        return;
      }

      if(event.type == "heal" && isAtonement(event)) {

        if(_encounteredTargetIDs.indexOf(event.targetID) >= 0) {

          //  We found a repeating targetID. Move the last damaging event here
          for(let j = fixedEvents.length - 1; j > 0; j--) {
            if(fixedEvents[j].type == "damage" && fixedEvents[j].sourceIsFriendly) {
              fixedEvents.splice(fixedEvents.length - 2, 0, fixedEvents.splice(j, 1)[0]);
              break;
            }
          }
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
