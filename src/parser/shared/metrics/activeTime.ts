import { AnyEvent, EventType } from 'parser/core/Events';
import metric, { Info } from 'parser/core/metric';
import { ClosedTimePeriod, duration, intersection, union } from 'parser/core/timePeriods';

// TODO possible extensions:
//   * channel and GCD time periods marked with spell, allowing additional filtering

/** Time periods the player was channeling during the encounter */
export const channelTimePeriods = metric((events: AnyEvent[], info: Info): ClosedTimePeriod[] => {
  /*
   * Method:
   * All completed channels can be calculated by just using the endchannel event,
   * which links back to the matching beginchannel. Cancelled channels must be ignored because
   * there's no way of knowing when they were cancelled. The one special case is a channel that is
   * started but the encounter ends before it finishes.
   */
  let uncoveredUncancelledBeginChannelTime: number | undefined = undefined;
  const results: ClosedTimePeriod[] = events.reduce((acc: ClosedTimePeriod[], event) => {
    if (event.type === EventType.BeginChannel && !event.isCancelled) {
      uncoveredUncancelledBeginChannelTime = event.timestamp;
    } else if (event.type === EventType.EndChannel) {
      acc.push({ start: event.beginChannel.timestamp, end: event.timestamp });
      uncoveredUncancelledBeginChannelTime = undefined;
    }
    return acc;
  }, []);
  // handle special case of channel in progress when encounter ends
  if (uncoveredUncancelledBeginChannelTime !== undefined) {
    results.push({ start: uncoveredUncancelledBeginChannelTime, end: info.fightEnd });
  }
  return results;
});

/**
 * Time periods the player was in a global cooldown during the encounter.
 * In cases where the haste isn't quite right or abilities are misspecified,
 * the returned time periods may have some overlap.
 */
export const gcdTimePeriods = metric((events: AnyEvent[], info: Info): ClosedTimePeriod[] =>
  events.reduce((acc: ClosedTimePeriod[], event) => {
    if (event.type === EventType.GlobalCooldown) {
      acc.push({ start: event.timestamp, end: event.timestamp + event.duration });
    }
    return acc;
  }, []),
);

/** The (non-overlapping) time periods the player was active during the encounter */
export const activeTimePeriods = metric((events: AnyEvent[], info: Info): ClosedTimePeriod[] =>
  union(channelTimePeriods(events, info).concat(gcdTimePeriods(events, info)), {
    start: info.fightStart,
    end: info.fightEnd,
  }),
);

/** The percentage of time the player was active during the encounter */
export const activeTimePercent = metric((events: AnyEvent[], info: Info): number => {
  const { fightStart, fightEnd } = info;
  return duration(activeTimePeriods(events, info)) / (fightEnd - fightStart);
});

/** The (non-overlapping) time periods the player was active during a given subset of the encounter */
export const activeTimePeriodSubset = (
  events: AnyEvent[],
  info: Info,
  subset: ClosedTimePeriod,
): ClosedTimePeriod[] =>
  activeTimePeriods(events, info)
    .map((t) => intersection(t, subset))
    .filter((t): t is ClosedTimePeriod => t !== null);
