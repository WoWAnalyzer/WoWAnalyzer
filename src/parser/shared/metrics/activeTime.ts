import { AnyEvent, EventType } from 'parser/core/Events';
import metric, { Info } from 'parser/core/metric';
import { ClosedTimePeriod, union } from 'parser/core/timePeriods';

// TODO possible extensions:
//   * channel and GCD time periods marked with spell, allowing additional filtering

/** Time periods the player was channeling during the encounter */
export const channelTimePeriods = metric((events: AnyEvent[], info: Info): ClosedTimePeriod[] => {
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
});

/** Time periods the player was in a global cooldown during the encounter */
export const gcdTimePeriods = metric((events: AnyEvent[], info: Info): ClosedTimePeriod[] => {
  return events.reduce((acc: ClosedTimePeriod[], event) => {
    if (event.type === EventType.GlobalCooldown) {
      acc.push({ start: event.timestamp, end: event.timestamp + event.duration });
    }
    return acc;
  }, []);
});

/** Time periods the player was active during the encounter */
export const activeTimePeriods = metric((events: AnyEvent[], info: Info): ClosedTimePeriod[] => {
  return union(channelTimePeriods(events, info).concat(gcdTimePeriods(events, info)), {
    start: info.fightStart,
    end: info.fightEnd,
  });
});
