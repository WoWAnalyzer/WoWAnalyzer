/**
 * Helper object to look up the value of a `State` at a point in time, slice the history, etc.
 *
 * The most common use case is `EventHistory`, where `State` is some type of Event.
 */
export default class StateHistory<State extends { timestamp: number }> {
  readonly history: State[];
  constructor(history: State[]) {
    this.history = history;
  }

  /**
   * Get the first state that occurs on or before `timestamp` (aka <=). When `strict` is true, this excludes states that occur exactly on the timestamp.
   */
  getBefore(timestamp: number, strict = false): State | undefined {
    let left = 0;
    let right = this.history.length - 1;

    let nearestIndex: number | undefined;

    while (left <= right) {
      const middle = Math.ceil((left + right) / 2);
      const point = this.history[middle];

      if (point.timestamp === timestamp && !strict) {
        // exact match. scan forward to find the last point equal to the timestamp
        nearestIndex = middle;
        for (let next = middle + 1; next < this.history.length; next++) {
          const nextPoint = this.history[next];
          if (nextPoint.timestamp === timestamp) {
            nearestIndex = next;
          } else {
            break;
          }
        }
        break;
      } else if (point.timestamp >= timestamp) {
        right = middle - 1;
      } else {
        // point.timestamp < timestamp
        nearestIndex = middle;
        left = middle + 1;
      }
    }

    return nearestIndex !== undefined ? this.history[nearestIndex] : undefined;
  }

  /**
   * Get the first state that occurs on or after `timestamp` (aka >=). When `strict` is true, this excludes states that occur exactly on the timestamp.
   */
  getAfter(timestamp: number, strict = false): State | undefined {
    let left = 0;
    let right = this.history.length - 1;

    let nearestIndex: number | undefined;

    while (left <= right) {
      const middle = Math.ceil((left + right) / 2);
      const point = this.history[middle];

      if (point.timestamp === timestamp && !strict) {
        // exact match. scan backward to find the first point equal to the timestamp
        nearestIndex = middle;
        for (let next = middle - 1; next > 0; next--) {
          const nextPoint = this.history[next];
          if (nextPoint.timestamp === timestamp) {
            nearestIndex = next;
          } else {
            break;
          }
        }
        break;
      } else if (point.timestamp <= timestamp) {
        left = middle + 1;
      } else {
        // point.timestamp > timestamp
        nearestIndex = middle;
        right = middle - 1;
      }
    }

    return nearestIndex !== undefined ? this.history[nearestIndex] : undefined;
  }

  /**
   * Retrieve a slice of states with `timestamp >= start` and `timestamp <= end`
   */
  slice(start: number, end: number): State[] {
    let left = 0;
    let right = this.history.length - 1;

    // the last index seen that is <= the start of the range
    let nearestLeftIndex: number = left;
    // the last index seen that is > the start of the range
    let nearestRightIndex: number = right + 1;

    // do a binary search for the left (prior) point of the range. along the way,
    // narrow down the right (post) point's location
    while (left <= right) {
      const middle = Math.ceil((left + right) / 2);
      const point = this.history[middle];

      if (point.timestamp === start) {
        // exact match. scan backward to find the first point equal to the start
        nearestLeftIndex = middle;
        for (let next = middle - 1; next > 0; next--) {
          const nextPoint = this.history[next];
          if (nextPoint.timestamp === start) {
            nearestLeftIndex = next;
          } else {
            break;
          }
        }
        break;
      } else if (point.timestamp < start) {
        left = middle + 1;
      } else {
        // point.timestamp > start
        right = middle - 1;
        nearestLeftIndex = middle;
        if (point.timestamp > end) {
          // make note for later
          nearestRightIndex = middle;
        }
      }
    }

    left = nearestLeftIndex + 1;
    right = nearestRightIndex - 1;

    // now do a binary search to find the right (post) end of the
    // this begins using the information found in the first search.
    while (left <= right) {
      const middle = Math.ceil((left + right) / 2);
      const point = this.history[middle];

      if (point.timestamp === end) {
        // exact match. scan forward to find the last point equal to the end
        nearestRightIndex = middle + 1;
        for (let next = middle + 1; next < this.history.length; next++) {
          const nextPoint = this.history[next];
          if (nextPoint.timestamp === end) {
            nearestRightIndex = next + 1;
          } else {
            break;
          }
        }
        break;
      } else if (point.timestamp > end) {
        right = middle - 1;
      } else {
        // point.timestamp < end
        nearestRightIndex = middle + 1;
        left = middle + 1;
      }
    }

    return this.history.slice(nearestLeftIndex, nearestRightIndex);
  }
}
