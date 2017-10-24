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
    console.log(events.slice());
    let fixedEvents = events;
    fixedEvents = this._reorderAtonementEventsBetweenDamagingEvents(fixedEvents);
    fixedEvents = this._reorderAtonementEventsFromSuccesiveDamagingEvents(fixedEvents);
    console.log(fixedEvents);
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

    let _lastEventWasDamage = false;

    let _staggeredEvents = [];

    let _encounteredTargetIDs = [];

    events.forEach((event, eventIndex) => {

      fixedEvents.push(event);

      //  this event needs to be pushed down to next block
      //  we remove it from array to be staggered
      if(event.type == "damage" && event.sourceIsFriendly && _lastEventWasDamage) {
        _staggeredEvents.push(event);
        fixedEvents.splice(fixedEvents.length - 1, 1);
        console.log("staggered event at: " + eventIndex);
      }

      //
      if(event.type == "heal" && _encounteredTargetIDs.indexOf(event.targetID) >= 0 && _staggeredEvents.length > 0) {
        console.log()
        fixedEvents.splice(fixedEvents.length - 1, 0, _staggeredEvents[0]);
        _staggeredEvents.splice(0, 1);
      }


      if(event.type == "damage" && event.sourceIsFriendly) {
        _lastEventWasDamage = true;
        _encounteredTargetIDs = [];
      }

      if(event.type == "heal" && isAtonement(event)) {
        _lastEventWasDamage = false;
        _encounteredTargetIDs.push(event.targetID);
      }



    });

    return fixedEvents;
  }

}

export default AtonementAttribution;
