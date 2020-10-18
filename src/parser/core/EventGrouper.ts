import { AnyEvent } from 'parser/core/Events';

/**
 * Groups events based on a given timestamp threshold
 * e.g.
 *   { timestamp: 0 }, { timestamp: 100 }, { timestamp: 200 }, { timestamp: 300 }
 * with a threshold of 100 would result in:
 * 0: [ { timestamp: 0 }, { timestamp: 100 } ]
 * 200: [ { timestamp: 200 }, { timestamp: 300 } ]
 */

/**
 * @description A group of events starting at the provided timestamp
 */
type EventGroup<T> = { timestamp: number, events: T[] }

export default class EventGrouper<T extends AnyEvent> {
  threshold: number;
  cache: { [stem: number]: T[] };

  constructor(threshold: number) {
    this.threshold = threshold;
    this.cache = {};
  }

  /**
   * @deprecated Use eventGroups method instead
   */
  [Symbol.iterator]() {
    return Object.entries(this.cache).map(item => item[1])[Symbol.iterator]();
  }

  /**
   * @description Provides all captured event groups with the associated starting timestamp
   */
  get eventGroups(): Array<EventGroup<T>> {
    return Object.entries(this.cache).map(([timestamp, events]) => ({ timestamp: Number(timestamp), events }));
  }

  processEvent(event: T) {
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

  private getStemTimestamp(event: T) {
    return Object.keys(this.cache).map(Number).filter(this.withinThreshold(event.timestamp))[0] || null;
  }

  private withinThreshold(timestamp: number) {
    return (stemTimestamp: number) => (timestamp <= (stemTimestamp + this.threshold)) && (timestamp > stemTimestamp);
  }

  private addNewStemTimestamp(event: T) {
    this.cache[event.timestamp] = [event];
  }
}
