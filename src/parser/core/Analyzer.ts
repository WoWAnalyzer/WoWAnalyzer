import React from 'react';

import EventFilter, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from './EventFilter';
import { EventType, MappedEvent } from './Events';
import EventSubscriber, { EventListener, Options as _Options } from './EventSubscriber';
import { When } from './ParseResults';

export { SELECTED_PLAYER, SELECTED_PLAYER_PET };
export type Options = _Options;

export interface ParseResultsTab {
  title: string;
  url: string;
  render: () => React.ReactNode;
}

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
  suggestions(when: When) {}
  /**
   * @deprecated Return a `Panel` from the statistic method instead.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  tab(): ParseResultsTab | void {}
}

export default Analyzer;
