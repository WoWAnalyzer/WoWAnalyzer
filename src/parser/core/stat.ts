import { Info } from './CombatLogParser';
import { AnyEvent } from './Events';

export type Stat<Value = any> = (events: AnyEvent[], info: Info) => Value;

const stat = <Value = any>(fn: Stat<Value>): Stat<Value> => {
  // We store the last events in the CombatLogParser anyway, so leaving
  // instances in stats should not be significant.
  let lastEvents: AnyEvent[] | undefined = undefined;
  let lastValue: any | undefined = undefined;

  return (events, info) => {
    if (events !== lastEvents) {
      lastValue = fn(events, info);
      lastEvents = events;
    }

    return lastValue;
  };
};

export default stat;
