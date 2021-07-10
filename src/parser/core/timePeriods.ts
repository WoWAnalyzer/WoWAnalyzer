/*
 * A collection of types and functions that help with the creation and manipulation of time periods.
 * All time fields are implicitly assumed to be log timestamps i.e. milliseconds since start of logging.
 */

import Fight from 'parser/core/Fight';

/**
 * A standard time period with explicitly defined start and end times.
 */
export type ClosedTimePeriod = {
  start: number;
  end: number;
};

/**
 * An 'open' time period whose start and/or end times might not be defined.
 * Open time periods may be bounded by its enclosing time period during calculations.
 *
 * For example, a buff's duration might be an open time period with respect to the encounter,
 * where the buff might not have a start time if it was applied before the encounter
 * and might not have an end time if it was still active when the encounter ended.
 * In this case, the fight's duration is the enclosing time period.
 */
export type OpenTimePeriod = Partial<ClosedTimePeriod>;

/**
 * Gets the logical intersection of two time periods, at least one of which must be closed
 * @return a closed time period representing the intersection of the two period,
 *   or null if the time periods do not overlap
 */
export function intersection(time: OpenTimePeriod, closedTime: ClosedTimePeriod): ClosedTimePeriod | null {
  const start = time.start === undefined
    ? closedTime.start
    : Math.max(time.start, closedTime.start);
  const end = time.end === undefined
    ? closedTime.end
    : Math.min(time.end, closedTime.end);
  return (start >= end) ? null : { start, end };
}

/**
 * Gets the intersection of a given time period with an encounter.
 */
export function intersectionWithFight(time: OpenTimePeriod, fight: Fight): ClosedTimePeriod | null {
  return intersection(time, { start: fight.start_time, end: fight.end_time });
}

/**
 * Given a collection of possibly overlapping time periods, merges these periods
 * to create a non-overlapping union of the given time periods, enclosed by an overarching period.
 */
export function mergeTimePeriods(times: OpenTimePeriod[], enclosingTimePeriod: ClosedTimePeriod): ClosedTimePeriod[] {
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
    .map(otp => intersection(otp, enclosingTimePeriod))
    .filter((otp): otp is ClosedTimePeriod => otp !== null)
    .flatMap((time) => [
      { time: time.start, change: 1 },
      { time: time.end, change: -1 },
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

/**
 * Given a collection of possibly overlapping time periods, merges these periods
 * to create a non-overlapping union of the given time periods, enclosed by the given encounter.
 */
export function mergeTimePeriodsWithFight(times: OpenTimePeriod[], fight: Fight): ClosedTimePeriod[] {
  return mergeTimePeriods(times, { start: fight.start_time, end: fight.end_time });
}
