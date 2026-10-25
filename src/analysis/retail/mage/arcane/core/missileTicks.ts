import { CastEvent, DamageEvent } from 'parser/core/Events';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';

/** Hits on one target within this window of the first hit are one tick (a tick can launch several missiles). */
const TICK_GROUP_WINDOW = 40;
/** A cast with no hit on its target this recently has no missiles still in flight from a previous cast. */
const CLEAN_CAST_WINDOW = 700;
/** Fallback missile travel time until a clean cast lets us measure it. */
const DEFAULT_TRAVEL_TIME = 300;
const TRAVEL_TIME_TOLERANCE = 60;
const MAX_CHANNEL_TIME = 4000;

export interface MissileTickResult {
  /** Number of ticks attributed to the cast, capped at maxTicks. */
  ticks: number;
  /** Time the primary target was hit for each tick. */
  tickTimes: number[];
  /** Estimated time for a missile to reach the target. */
  travelTime: number;
  /** Median time between this cast's ticks, if it had at least two. */
  tickInterval?: number;
}

function targetKey(event: CastEvent | DamageEvent) {
  return encodeEventTargetString(event) ?? '';
}

/** Collapses damage events into one timestamp per tick for each target. */
function groupTicksByTarget(hits: DamageEvent[]) {
  const ticksByTarget = new Map<string, number[]>();
  hits.forEach((hit) => {
    const key = targetKey(hit);
    const times = ticksByTarget.get(key) ?? [];
    if (times.length === 0 || hit.timestamp - times[times.length - 1] > TICK_GROUP_WINDOW) {
      times.push(hit.timestamp);
    }
    ticksByTarget.set(key, times);
  });
  return ticksByTarget;
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * Works out how many ticks each Arcane Missiles cast got.
 *
 * Arcane Missiles has no per-tick event and cleaves, so a tick shows up as hits on several targets
 * at the same timestamp (and sometimes several hits on one target). Only the cast's target is used,
 * and hits within TICK_GROUP_WINDOW are one tick.
 *
 * Missiles take time to land, so with chained casts the last ticks of one cast land after the next
 * cast starts. Each cast claims the next unclaimed ticks on its target, up to maxTicks, stopping at
 * the next cast on the same target plus the estimated travel time.
 *
 * @param casts Arcane Missiles casts in chronological order
 * @param hits Arcane Missiles damage events by the same player in chronological order
 * @returns one result per cast, in the same order
 */
export function attributeMissileTicks(
  casts: CastEvent[],
  hits: DamageEvent[],
  maxTicks: number,
): MissileTickResult[] {
  const ticksByTarget = groupTicksByTarget(hits);
  const claimed = new Map<string, number>();
  let travelTime = DEFAULT_TRAVEL_TIME;

  return casts.map((cast, index) => {
    const target = targetKey(cast);
    const ticks = ticksByTarget.get(target) ?? [];
    const castTime = cast.timestamp;
    const firstTick = ticks.findIndex((t) => t >= castTime);

    const hasInFlightMissiles = ticks.some(
      (t) => t < castTime && castTime - t <= CLEAN_CAST_WINDOW,
    );
    if (!hasInFlightMissiles && firstTick !== -1) {
      travelTime = ticks[firstTick] - castTime;
    }

    const nextCast = casts.slice(index + 1).find((other) => targetKey(other) === target);
    const windowEnd = Math.min(
      (nextCast?.timestamp ?? Infinity) + travelTime - TRAVEL_TIME_TOLERANCE,
      castTime + travelTime + MAX_CHANNEL_TIME,
    );

    const start = Math.max(claimed.get(target) ?? 0, firstTick === -1 ? ticks.length : firstTick);
    let end = start;
    while (end < ticks.length && end - start < maxTicks && ticks[end] < windowEnd) {
      end += 1;
    }
    claimed.set(target, end);

    const tickTimes = ticks.slice(start, end);
    const gaps = tickTimes.slice(1).map((t, i) => t - tickTimes[i]);
    return {
      ticks: tickTimes.length,
      tickTimes,
      travelTime,
      tickInterval: gaps.length > 0 ? median(gaps) : undefined,
    };
  });
}
