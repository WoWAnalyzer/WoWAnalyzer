import * as React from 'react';

import EventFilter, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from './EventFilter';
import Events, { AnyEvent, EventType, FightEndEvent, MappedEvent } from './Events';
import EventSubscriber, { EventListener, Options as _Options } from './EventSubscriber';
import { Metric } from './metric';
import Module from './Module';
import { When, Issue } from './ParseResults';

export { SELECTED_PLAYER, SELECTED_PLAYER_PET };
export type Options = _Options;

export interface ParseResultsTab {
  title: string;
  url: string;
  render: () => React.ReactNode;
}

type Dependencies = typeof Module['dependencies'];

class Analyzer extends EventSubscriber {
  /**
   * Called when the parser finished initializing; after all required
   * dependencies are loaded, normalizers have ran and combatants were
   * initialized. Use this method to toggle the module on/off based on having
   * items equipped, talents selected, etc.
   */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(options: Options) {
    super(options);
  }
  addEventListener<ET extends EventType, E extends MappedEvent<ET>>(
    eventFilter: ET | EventFilter<ET>,
    listener: EventListener<ET, E>,
  ) {
    super.addEventListener(eventFilter, listener);
  }

  // Override these with functions that return info about their rendering in the specific slots
  statistic(): React.ReactNode {
    return undefined;
  }
  /**
   * @deprecated Set the `position` property on the Statistic component instead.
   */
  statisticOrder?: number = undefined;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  suggestions(when: When): Issue[] | void {}
  /**
   * @deprecated Return a `Panel` from the statistic method instead.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  tab(): ParseResultsTab | void {}
}

export default Analyzer;

type ConstructedDependency<T> = T extends new (options: Options) => infer R ? R : never;

type InjectedDependencies<Deps extends Dependencies> = {
  [Key in keyof Deps]: ConstructedDependency<Deps[Key]>;
};

export enum FunctionType {
  Statistic,
  Suggestion,
}

function buildFunctionalAnalyzer<Deps extends Dependencies, Result = any>(
  functionType: FunctionType,
  metric: Metric<Result>,
  eventFilter: EventFilter<any> | Array<EventFilter<any>> = [Events.any],
  dependencies?: Deps,
) {
  const eventFilters: Array<EventFilter<any>> = Array.isArray(eventFilter)
    ? eventFilter
    : [eventFilter];

  const deps = dependencies ?? {};

  const analyzer = class extends Analyzer {
    static dependencies = deps;

    eventList: AnyEvent[] = [];
    result?: Result;

    constructor(options: Options) {
      super(options);

      eventFilters.forEach((filter) => this.addEventListener(filter, this.appendEvent));

      this.addEventListener(Events.fightend, this.run);
    }

    private appendEvent(event: AnyEvent) {
      this.eventList.push(event);
    }

    private run(_event: FightEndEvent) {
      const finalDependencies: InjectedDependencies<Deps> = (Object.fromEntries(
        Object.entries(deps).map(([key, depCtor]) => [
          key,
          ((this as unknown) as any)[key] as ConstructedDependency<typeof depCtor>,
        ]),
      ) as unknown) as InjectedDependencies<Deps>;

      this.result = metric(this.eventList, this.owner.info, finalDependencies);
    }

    statistic(): React.ReactNode {
      if (functionType === FunctionType.Statistic) {
        return this.result;
      }
    }

    suggestions(_when: When): Issue[] | void {
      if (functionType === FunctionType.Suggestion) {
        if (Array.isArray(this.result)) {
          return this.result as Issue[];
        } else {
          return [this.result as unknown] as Issue[];
        }
      }
    }
  };

  Object.defineProperty(analyzer, 'name', { value: metric.name, writable: false });
  return analyzer;
}

export const statistic = buildFunctionalAnalyzer.bind(null, FunctionType.Statistic);
export const suggestion = buildFunctionalAnalyzer.bind(null, FunctionType.Suggestion);
