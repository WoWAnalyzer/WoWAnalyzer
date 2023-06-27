import * as React from 'react';

import type { Suggestion } from './CombatLogParser';
import EventFilter, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from './EventFilter';
import Events, { AnyEvent, EventType } from './Events';
import EventSubscriber, { EventListener, Options as _Options } from './EventSubscriber';
import { Info, Metric } from './metric';
import Module from './Module';
import { When } from './ParseResults';
import { MessageDescriptor } from '@lingui/core';

export { SELECTED_PLAYER, SELECTED_PLAYER_PET };
export type Options = _Options;

export interface ParseResultsTab {
  title: string | MessageDescriptor;
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
  addEventListener<ET extends EventType, E extends AnyEvent<ET>>(
    eventFilter: ET | EventFilter<ET>,
    listener: EventListener<ET, E>,
  ) {
    super.addEventListener(eventFilter, listener);
  }

  // Override these with functions that return info about their rendering in the specific slots
  statistic(): React.ReactNode {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  suggestions(when: When): Suggestion[] | void {}
  /**
   * @deprecated Return a `Panel` from the statistic method instead.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  tab(): ParseResultsTab | void {}
}

export default Analyzer;

type ConstructedDependency<T> = T extends new (options: Options) => infer R ? R : never;

export type InjectedDependencies<Deps extends Dependencies> = {
  [Key in keyof Deps]: ConstructedDependency<Deps[Key]>;
};

export enum FunctionType {
  Statistic,
  Suggestion,
}

type FunctionalEventFilter = EventFilter<any> | Array<EventFilter<any>>;

function buildFunctionalAnalyzer<Deps extends Dependencies, Result = any>(
  functionType: FunctionType,
  metric: Metric<Result>,
  eventFilter: FunctionalEventFilter = Events.any,
  dependencies?: Deps,
) {
  const eventFilters: Array<EventFilter<any>> = Array.isArray(eventFilter)
    ? eventFilter
    : [eventFilter];

  const deps = dependencies ?? {};

  const analyzer = class extends Analyzer {
    static dependencies = deps;

    eventList: AnyEvent[] = [];

    constructor(options: Options) {
      super(options);

      eventFilters.forEach((filter) => this.addEventListener(filter, this.appendEvent));
    }

    private appendEvent(event: AnyEvent) {
      this.eventList.push(event);
    }

    public static run(events: AnyEvent[], info: Info, deps?: InjectedDependencies<Deps>) {
      return metric(events, info, deps);
    }

    statistic(): React.ReactNode {
      if (functionType === FunctionType.Statistic) {
        return analyzer.run(
          this.eventList,
          this.owner.info,
          this as unknown as InjectedDependencies<Deps>,
        );
      }
    }

    suggestions(_when: When): Suggestion[] | void {
      if (functionType === FunctionType.Suggestion) {
        const result = analyzer.run(
          this.eventList,
          this.owner.info,
          this as unknown as InjectedDependencies<Deps>,
        );

        if (result === undefined) {
          return [];
        }

        if (Array.isArray(result)) {
          return result as Suggestion[];
        } else {
          return [result as unknown] as Suggestion[];
        }
      }
    }
  };

  Object.defineProperty(analyzer, 'name', { value: metric.name, writable: false });
  return analyzer;
}

export const statistic = (
  metric: Metric<React.ReactNode | undefined>,
  eventFilter?: FunctionalEventFilter,
  dependencies?: Dependencies,
) => buildFunctionalAnalyzer(FunctionType.Statistic, metric, eventFilter, dependencies);
export const suggestion = (
  metric: Metric<Suggestion | Suggestion[] | undefined>,
  eventFilter?: FunctionalEventFilter,
  dependencies?: Dependencies,
) => buildFunctionalAnalyzer(FunctionType.Suggestion, metric, eventFilter, dependencies);
