import EventFilter from './EventFilter';
import { EventType, AnyEvent } from './Events';
import Module, { Options as _Options } from './Module';

export type Options = _Options;

export type EventListener<ET extends EventType, E extends AnyEvent<ET>> = (event: E) => void;

class EventSubscriber extends Module {
  addEventListener<ET extends EventType, E extends AnyEvent<ET>>(
    eventFilter: ET | EventFilter<ET>,
    listener: EventListener<ET, E>,
  ) {
    if (!this.active) {
      return;
    }
    this.owner.addEventListener(eventFilter, listener.bind(this), this);
  }
}

export default EventSubscriber;
