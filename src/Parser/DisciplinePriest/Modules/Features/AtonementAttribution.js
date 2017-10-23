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
    return fixedEvents;
  }
}

export default AtonementAttribution;
