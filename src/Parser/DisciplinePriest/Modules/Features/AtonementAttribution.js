import React from 'react';

import Module from 'Parser/Core/Module';
import isAtonement from '../Core/isAtonement';

class AtonementAttribution extends Module {

  reorderEvents(events) {
    // Push down atonement healing on self to the next atonement healing
    let movesToMake = [];

    for(let i = 0; i < events.length; i++){
      if(events[i].type === "heal" && isAtonement(events[i]) && events[i].sourceID == events[i].targetID) {
        // Find next atonement healing and move it right before it
        for(let j = i + 1; j < events.length; j++) {
          if(events[j].type == "heal" && isAtonement(events[j])) {
            movesToMake.push({"From": i, "To": j - 1})
            break;
          }
        }
      }
    }

    for(let i = 0; i < movesToMake.length;i++){
      events.splice(movesToMake[i].To, 0, events.splice(movesToMake[i].From, 1)[0]);
    }

    return events;
  }
}

export default AtonementAttribution;
