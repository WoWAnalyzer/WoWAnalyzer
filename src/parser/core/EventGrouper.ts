import { Event } from 'parser/core/Events';

/**
 * Groups events based on a given timestamp threshold
 * e.g.
 *   { timestamp: 0 }, { timestamp: 100 }, { timestamp: 200 }, { timestamp: 300 }
 * with a threshold of 100 would result in:
 * 0: [ { timestamp: 0 }, { timestamp: 100 } ]
 * 200: [ { timestamp: 200 }, { timestamp: 300 } ]
 */

export default class EventGrouper {
  threshold: number;
  cache: { [stem: number]: Event<any>[] };

  constructor(threshold: number) {
    this.threshold = threshold;
    this.cache = {};
  }

  [Symbol.iterator]() {
    return Object.entries(this.cache).map(item => item[1])[Symbol.iterator]();
  }

  processEvent(event: Event<any>) {
    const stemTimestamp = this.getStemTimestamp(event);
    if (!stemTimestamp) {
      this.addNewStemTimestamp(event);
      return;
    }

    this.cache[stemTimestamp] = [
      ...this.cache[stemTimestamp],
      event,
    ];
  }

  getStemTimestamp(event: Event<any>) {
    return Object.keys(this.cache).map(Number).filter(this.withinThreshold(event.timestamp))[0] || null;
  }

  withinThreshold(timestamp: number) {
    return (stemTimestamp: number) => (timestamp <= (stemTimestamp + this.threshold)) && (timestamp > stemTimestamp);
  }

  addNewStemTimestamp(event: Event<any>) {
    this.cache[event.timestamp] = [event];
  }
}
