export type OpenTimePeriod = {
  start: number;
  end?: number;
};

export type ClosedTimePeriod = {
  start: number;
  end: number;
};

/**
 * Given a collection of possibly overlapping time periods (objects with a start and end), merges these periods
 * to create a non-overlapping union of the given time periods.
 */
export function mergeTimePeriods(times: OpenTimePeriod[], maxTime: number): ClosedTimePeriod[] {
  /*
   * Algorithm:
   * Break down the time periods into 'start' and 'end' events, then sort them by time.
   * Iterate through the events in order while keeping track of the number of active time periods
   * by incrementing a counter for every 'start' and decrementing for every 'end'.
   * When the counter goes from 0 to 1 we know it's the start of a merged time period,
   * and when it goes from 1 to 0 we know it's the end of that period.
   * We can then further consolidate time periods by merging adjacent periods,
   * which could happen if there is an edge from 1 to 0 then 0 to 1 on the same timestamp.
   */
  type PeriodEdge = { time: number; change: number };
  const merged: ClosedTimePeriod[] = [];
  let active = 0;
  let currStart = 0;
  times
    .flatMap((time) => [
      { time: time.start, change: 1 },
      { time: time.end === undefined ? maxTime : time.end, change: -1 },
    ])
    .sort((a: PeriodEdge, b: PeriodEdge) => a.time - b.time)
    .forEach((edge) => {
      const wasActive = active;
      active += edge.change;
      if (wasActive === 0 && active > 0) {
        currStart = edge.time;
      } else if (wasActive > 0 && active === 0) {
        merged.push({ start: currStart, end: edge.time });
      }
    });

  const adjacentMerged: ClosedTimePeriod[] = [];
  let lastPeriod: ClosedTimePeriod | undefined = undefined;
  merged.forEach((period) => {
    if (!lastPeriod) {
      lastPeriod = period;
      return;
    }
    let newPeriod = period;
    if (lastPeriod.end === period.start) {
      newPeriod = { start: lastPeriod.start, end: period.end };
    } else {
      adjacentMerged.push(lastPeriod);
    }
    lastPeriod = newPeriod;
  });
  if (lastPeriod) {
    adjacentMerged.push(lastPeriod);
  }

  return adjacentMerged;
}
