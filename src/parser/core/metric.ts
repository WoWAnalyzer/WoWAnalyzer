import { AnyEvent } from './Events';
import Ability from './modules/Ability';

export interface Info {
  playerId: number;
  abilities: Ability[];
  fightStart: number;
  fightEnd: number;
}
export interface FunctionalStatisticProps {
  events: AnyEvent[];
  info: Info;
}
export type Metric<Value = any> = (events: AnyEvent[], info: Info, ...args: any[]) => Value;

const metric = <T extends any[], U>(fn: (events: AnyEvent[], ...args: T) => U) => {
  // We store the last events in the CombatLogParser anyway, so leaving
  // instances in stats should not be significant.
  let lastEvents: AnyEvent[] | undefined = undefined;
  let lastValue: any | undefined = undefined;

  return (events: AnyEvent[], ...args: T): U => {
    if (events !== lastEvents) {
      lastValue = fn(events, ...args);
      lastEvents = events;
    }

    return lastValue;
  };
};

export default metric;
