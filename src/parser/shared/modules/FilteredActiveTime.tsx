import Analyzer from 'parser/core/Analyzer';
import { AnyEvent, EventType } from 'parser/core/Events';

const BUFFER = 3000;

class FilteredActiveTime extends Analyzer {

  filterEvents(events: AnyEvent[], start: number, end: number) {
    let filteredEvents = []
    filteredEvents = events.filter(event => event.timestamp >= start && event.timestamp <= end && (event.type === EventType.GlobalCooldown || event.type === EventType.EndChannel));
    return filteredEvents;
  }

  getActiveTime(start: number, end: number, events: AnyEvent[] = this.owner.eventHistory) {
    let activeTime = 0;
    let lastGCD: {
      duration: number,
      timestamp: number,
    } = { duration: 0, timestamp: 0};
    const filteredEvents = this.filterEvents(events, start - BUFFER, end + BUFFER);

    filteredEvents.forEach(event => {

      //Global Cooldown
      if (event.type === EventType.GlobalCooldown) {
        lastGCD = { duration: event.duration, timestamp: event.timestamp };

        //If the GCD was triggered by a BeginChannel event, then this will get counted via the EndChannel event, so we need to return so we dont double count it ... unless it extends beyond the end timestamp.
        //If the GCD does not extend beyond the start timestamp or was started agter the end timestamp, then we can get rid of those as well.
        if ((event.trigger.type === EventType.BeginChannel && event.timestamp + event.duration < end) || event.timestamp < start - event.duration || event.timestamp > end) {
          return;
        }

        //If a spell was on GCD at the start of the timeframe, then count the portion after the "start" time. Likewise if a GCD extended beyond the end of the timeframe, then count the portion before the "end" time.
        if (start - event.timestamp > 0) {
          activeTime += (event.timestamp + event.duration) - start;
        } else if (event.timestamp + event.duration >= end) {
          activeTime += (end - event.timestamp);
        } else {
          activeTime += event.duration;
        }
      } 
      
      //End Channel
      if (event.type === EventType.EndChannel) {

        //If the channel ended before the start timestamp or began after the end timestamp, then return so it isnt counted.
        //If the end channel was for an instant spell (end channel and the gcd were at the same timestamp) and it was cast after the end timestamp, then disregard that as well.
        if (event.start < start - event.duration || event.start > end || (event.timestamp === lastGCD.timestamp && event.timestamp + lastGCD.duration > end)) {
          return;
        }

        if (event.start < start) {
          activeTime += Math.max(event.timestamp - start, (event.timestamp + lastGCD.duration) - start);
        } else if (event.timestamp > end) {
          activeTime += Math.max(end - event.start, end - lastGCD.timestamp);
        } else {
          activeTime += Math.max(event.duration, lastGCD.duration);
        }
      }
    })
    return activeTime;
  }

  getDowntime(start: number, end: number, events: AnyEvent[] = this.owner.eventHistory) {
    const activeTime = this.getActiveTime(start, end, events);
    const duration = end - start;
    return duration - activeTime;
  }
}

export default FilteredActiveTime;
