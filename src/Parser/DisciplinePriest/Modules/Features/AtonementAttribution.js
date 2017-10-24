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
    let fixedEvents = events;
    fixedEvents = _reorderAtonementEventsBetweenDamagingEvents(fixedEvents);
    fixedEvents = _reorderAtonementEventsFromSuccesiveDamagingEvents(fixedEvents);
    return fixedEvents;
  }

  // Reordering when 2 simultaneous damaging events happen but the
  // atonement of the first event heals self before since there is
  // no latency to self heal. We fix this by pushing down the
  // self atonement to the next atonement healing
  _reorderAtonementEventsBetweenDamagingEvents(events){

    const fixedEvents = [];

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

    return fixedEvents;
  }

  _reorderAtonementEventsFromSuccesiveDamagingEvents(events) {

    let fixedEvents = [];

    let _atonementBlock = [];
    let _damageEvents = [];

    let _encounteredTargetIDs = [];

    events.forEach((event, eventIndex) => {

      // this is a damaging event with previous atonement. This is the general
      // case
      if(event.type == "damage" && event.sourceIsFriendly && _atonementBlock.length > 0) {

        fixedEvents = fixedEvents.concat(_atonementBlock);
        _atonementBlock = [];
        _encounteredTargetIDs = [];

        fixedEvents.push(event);
      }

      // We encounter a targetID we already encountered. We need to split
      // atonement here
      if(event.type == "heal" && isAtonement(event) && _encounteredTargetIDs.indexOf(event.targetID) >= 0){
        fixedEvents = fixedEvents.concat(_atonementBlock);
        fixedEvents.push(_damageEvents[1]);
        _atonementBlock = [];
        _encounteredTargetIDs = [];
        _damageEvents.splice(1,1);
      }

      if(event.type == "damage" && event.sourceIsFriendly) {
        _damageEvents.push(event);
      }

      if(event.type == "heal" && isAtonement(event)){
        _atonementBlock.push(event);
        _encounteredTargetIDs.push(event.targetID);
      }
    });

    // Add the last atonements
    fixedEvents = fixedEvents.concat(_atonementBlock);

    return fixedEvents;
  }

}

export default AtonementAttribution;
