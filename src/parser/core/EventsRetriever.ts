import { AnyEvent } from 'parser/core/Events';

import Module from './Module';

/**
 * Module that can be used to retrieve events asynchronously.
 */
export default abstract class EventsRetriever extends Module {
  /**
   * You can use this function to retrieve additional events from WCL and insert them into the event stream.
   */
  abstract retrieve(): Promise<AnyEvent[]>;
}
