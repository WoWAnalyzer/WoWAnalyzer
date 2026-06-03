import { Interval } from './Interval';

const debug = false;

export class Intervals {
  protected intervals: Interval[];

  constructor() {
    this.intervals = [];
  }

  get totalDuration() {
    return this.intervals.reduce((acc, interval) => acc + interval.duration, 0);
  }

  get intervalsCount() {
    return this.intervals.length;
  }

  private get isLastIntervalInProgress() {
    const length = this.intervals.length;
    if (length === 0) {
      return false;
    }

    return !this.intervals[length - 1].ended;
  }

  startInterval(timestamp: number) {
    if (this.isLastIntervalInProgress) {
      debug &&
        console.error('Intervals: cannot start a new interval because one is already in progress.');
      return;
    }

    this.intervals.push(new Interval(timestamp));
  }

  endInterval(timestamp: number) {
    if (!this.isLastIntervalInProgress) {
      debug && console.error('Intervals: cannot end an interval because none are in progress.');
      return;
    }

    this.intervals[this.intervals.length - 1].end(timestamp);
  }

  /**
   * Total time within [start, end] that any interval was active. Treats an
   * in-progress interval as ending at `end`.
   */
  overlapWith(start: number, end: number): number {
    if (end <= start) {
      return 0;
    }
    let total = 0;
    for (const interval of this.intervals) {
      const overlapStart = Math.max(interval.startTime, start);
      const overlapEnd = Math.min(interval.endTime ?? end, end);
      if (overlapEnd > overlapStart) {
        total += overlapEnd - overlapStart;
      }
    }
    return total;
  }
}
