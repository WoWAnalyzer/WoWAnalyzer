import { AnyEvent, EventType } from './Events';

/**
 * Helper object to look up the value of a `State` at a point in time, slice the history, etc.
 *
 * The most common use case is `EventHistory`, where `State` is some type of Event.
 */
export default class StateHistory<State extends { timestamp: number }> {
  private _data: State[];
  private requiresSort = false;

  get data(): State[] {
    this.ensureSort();
    return this._data;
  }

  /**
   * @param requiresSort When true, the data will be sorted before operating. This is usually false, but is used to defer sorting when merging histories.
   */
  constructor(data: State[], requiresSort = false) {
    this._data = data;
    this.requiresSort = requiresSort;
  }

  /**
   * Get the first state that occurs on or before `timestamp` (aka <=). When `strict` is true, this excludes states that occur exactly on the timestamp.
   */
  getBefore(timestamp: number, strict = false): State | undefined {
    this.ensureSort();
    let left = 0;
    let right = this._data.length - 1;

    let nearestIndex: number | undefined;

    while (left <= right) {
      const middle = Math.ceil((left + right) / 2);
      const point = this._data[middle];

      if (point.timestamp === timestamp && !strict) {
        // exact match. scan forward to find the last point equal to the timestamp
        nearestIndex = middle;
        for (let next = middle + 1; next < this._data.length; next++) {
          const nextPoint = this._data[next];
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

    return nearestIndex !== undefined ? this._data[nearestIndex] : undefined;
  }

  /**
   * Get the first state that occurs on or after `timestamp` (aka >=). When `strict` is true, this excludes states that occur exactly on the timestamp.
   */
  getAfter(timestamp: number, strict = false): State | undefined {
    this.ensureSort();
    let left = 0;
    let right = this._data.length - 1;

    let nearestIndex: number | undefined;

    while (left <= right) {
      const middle = Math.ceil((left + right) / 2);
      const point = this._data[middle];

      if (point.timestamp === timestamp && !strict) {
        // exact match. scan backward to find the first point equal to the timestamp
        nearestIndex = middle;
        for (let next = middle - 1; next > 0; next--) {
          const nextPoint = this._data[next];
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

    return nearestIndex !== undefined ? this._data[nearestIndex] : undefined;
  }

  /**
   * Retrieve a slice of states with `timestamp >= start` and `timestamp <= end`. If `expand` is true,
   * also include the next event before/after the range. This is useful to include (for example) the
   * state of a cooldown before the range began.
   */
  slice(start: number, end: number, expand = false): StateHistory<State> {
    this.ensureSort();

    // handle the pathological cases: start > end of data or end < start of data
    if (
      (this._data.at(-1) && start > this._data.at(-1)!.timestamp) ||
      (this._data[0] && end < this._data[0].timestamp)
    ) {
      return new StateHistory([]);
    }

    let left = 0;
    let right = this._data.length - 1;

    // the last index seen that is <= the start of the range
    let nearestLeftIndex: number = left;
    // the last index seen that is > the start of the range
    let nearestRightIndex: number = right + 1;

    // do a binary search for the left (prior) point of the range. along the way,
    // narrow down the right (post) point's location
    while (left <= right) {
      const middle = Math.ceil((left + right) / 2);
      const point = this._data[middle];

      if (point.timestamp === start) {
        // exact match. scan backward to find the first point equal to the start
        nearestLeftIndex = middle;
        for (let next = middle - 1; next > 0; next--) {
          const nextPoint = this._data[next];
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
      const point = this._data[middle];

      if (point.timestamp === end) {
        // exact match. scan forward to find the last point equal to the end
        nearestRightIndex = middle + 1;
        for (let next = middle + 1; next < this._data.length; next++) {
          const nextPoint = this._data[next];
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

    if (expand) {
      nearestLeftIndex = Math.max(0, nearestLeftIndex - 1);
      nearestRightIndex = Math.min(this._data.length, nearestRightIndex + 1);
    }

    return new StateHistory(this._data.slice(nearestLeftIndex, nearestRightIndex));
  }

  union<Other extends { timestamp: number }>(
    other: StateHistory<Other>,
  ): StateHistory<State | Other> {
    const data = (this._data as (State | Other)[]).concat(other._data as (State | Other)[]);
    return new StateHistory(data, true);
  }

  private ensureSort(): void {
    if (!this.requiresSort) {
      return; // data is already sorted
    }

    this._data.sort((a, b) => a.timestamp - b.timestamp);
    this.requiresSort = false;
  }
}

export type EventHistory<T extends EventType> = StateHistory<AnyEvent<T>>;
