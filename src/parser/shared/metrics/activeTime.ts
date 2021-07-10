import { AnyEvent, EventType } from 'parser/core/Events';
import metric, { Info } from 'parser/core/metric';
import { ClosedTimePeriod, intersection, mergeTimePeriods } from 'parser/core/timePeriods';

// TODO possible extensions:
//   * channel and GCD time periods marked with spell, allowing additional filtering

const channelTimePeriodsPrivate = (events: AnyEvent[], info: Info): ClosedTimePeriod[] => {
  const { fightStart } = info;
  let lastChannelStart: number = fightStart;
  let channelCovered = false;
  const results: ClosedTimePeriod[] = events.reduce((acc: ClosedTimePeriod[], event) => {
    if (event.type === EventType.BeginChannel) {
      lastChannelStart = event.timestamp;
      channelCovered = false;
    } else if (event.type === EventType.EndChannel) {
      acc.push({ start: lastChannelStart, end: event.timestamp });
      channelCovered = true;
    }
    return acc;
  }, []);
  if (!channelCovered) {
    results.push({ start: lastChannelStart, end: info.fightEnd });
  }
  return results;
};
/** Time periods the player was channeling during the encounter */
export const channelTimePeriods = metric(channelTimePeriodsPrivate);

const gcdTimePeriodsPrivate = (events: AnyEvent[], info: Info): ClosedTimePeriod[] => {
  return events.reduce((acc: ClosedTimePeriod[], event) => {
    if (event.type === EventType.GlobalCooldown) {
      acc.push({ start: event.timestamp, end: event.timestamp + event.duration });
    }
    return acc;
  }, []);
};
/** Time periods the player was in a global cooldown during the encounter */
export const gcdTimePeriods = metric(gcdTimePeriodsPrivate);


const activeTimePeriodsPrivate = (events: AnyEvent[], info: Info): ClosedTimePeriod[] => {
  return mergeTimePeriods(channelTimePeriods(events, info).concat(gcdTimePeriods(events, info)), {
    start: info.fightStart,
    end: info.fightEnd,
  });
};
/** Time periods the player was active during the encounter */
export const activeTimePeriods = metric(activeTimePeriodsPrivate);

/** Time (in milliseconds) the player was active during the encounter */
const activeTime = (events: AnyEvent[], info: Info): number => {
  return activeTimePeriods(events, info).reduce((acc, t) => acc + t.end - t.start, 0);
}

export const activeTimePeriodsSubset = (events: AnyEvent[], info: Info, subset: ClosedTimePeriod): ClosedTimePeriod[] => {
  return activeTimePeriods(events, info)
    .map(t => intersection(t, subset))
    .filter((t): t is ClosedTimePeriod => t !== null)
}

export default metric(activeTime);
