import Module from 'Parser/Core/Module';
import isAtonement from '../Core/isAtonement';

class AtonementAttribution extends Module {
  /**
   *  This modules serves as a correction to the ordering in logs
   *  Currently in wlogs, atonement is handled by associating all the
   *  healing to the last damaging events. This breaks when damaging events
   *  happen simultaneously since it will associate the atonement of both
   *  events to the last event that occured. Also, because there is no
   *  latency on self-heals, the atonement on self can be seperated
   *  from it's respective atonement block.
   * @param {Array} events
   * @returns {Array}
   */
  reorderEvents(events) {
    const fixedEvents = [];

    // Reordering when 2 simultaneous damaging events happen but the
    // atonement of the first event heals self before since there is
    // no latency to self heal. We fix this by pushing down the
    // self atonement to the next atonement healing
    let _lastAtonementOnSelf = null;
    events.forEach((event, eventIndex) => {

      if(event.type === "heal" && isAtonement(event) && event.sourceID == event.targetID) {
        _lastAtonementOnSelf = event;
        return;
      }

      if(event.type === "heal" && isAtonement(event) && _lastAtonementOnSelf) {
        fixedEvents.push(_lastAtonementOnSelf);
        _lastAtonementOnSelf = null;
      }

      fixedEvents.push(event);

    });

    // Reordering when simultaneous damage events occur. We need to split
    // the atonement blocks ahead based off the targetIDs not repeating itself
    // inside an atonement block
    let _healingEvents = [];
    let _damageEvents = [];
    let fixedEvents2 = [];
    let encountered = [];

    fixedEvents.forEach((event, eventIndex) => {

      // This is the first damage after an atonement block
      // add the previous atonement and this damage event to the list
      if(event.type == "damage" && event.sourceIsFriendly && _healingEvents.length > 0) {
        fixedEvents2 = fixedEvents2.concat(_healingEvents);
        _healingEvents = [];
        encountered = [];
        fixedEvents2.push(event);
        return;
      }

      // This is an atonement for a targetID that already has healing since
      // last damaging event
      if(event.type == "heal" && isAtonement(event) && encountered.indexOf(event.targetID) >= 0){

        fixedEvents2 = fixedEvents2.concat(_healingEvents);
        _healingEvents = [];
        encountered = [];
        fixedEvents2.push(_damageEvents[0]);
        _damageEvents.splice(0,1);
      }

      //
      if(event.type == "damage" && event.sourceIsFriendly) {
        _damageEvents.push(event);

      }

      if(event.type == "heal" && isAtonement(event)){
        _healingEvents.push(event);
        encountered.push(event.targetID);
      }

      // End of events, we append the buffered events
      if(eventIndex == fixedEvents.length - 1){
        fixedEvents2 = fixedEvents2.concat(_healingEvents);
        fixedEvents2 = fixedEvents2.concat(_damageEvents);
      }


    });
    return fixedEvents2;
  }
}

export default AtonementAttribution;
