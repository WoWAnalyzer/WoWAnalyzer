import React from 'react';

import EventSubscriber, { EventListener, Options as _Options } from './EventSubscriber';
import EventFilter, {
  SELECTED_PLAYER,
  SELECTED_PLAYER_PET,
} from './EventFilter';
import { When } from './ParseResults';
import { EventType, MappedEvent } from './Events';

export { SELECTED_PLAYER, SELECTED_PLAYER_PET };
export type Options = _Options

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
  tab(): {
    title: string;
    url: string;
    render: React.FC;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  } | void {}
}

export default Analyzer;
