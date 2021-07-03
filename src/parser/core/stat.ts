import { Info } from './CombatLogParser';
import { AnyEvent } from './Events';

export type Stat<Value = any> = (events: AnyEvent[], info: Info, ...args: any[]) => Value;

const stat = <TValue>(fn: Stat<TValue>): Stat<TValue> => {
  // We store the last events in the CombatLogParser anyway, so leaving
  // instances in stats should not be significant.
  let lastEvents: AnyEvent[] | undefined = undefined;
  let lastValue: any | undefined = undefined;

  return (events, info, ...args) => {
    if (events !== lastEvents) {
      lastValue = fn(events, info, ...args);
      lastEvents = events;
    }

    return lastValue;
  };
};

export default stat;
