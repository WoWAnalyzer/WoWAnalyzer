import EventFilter, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from './EventFilter';
import { EventType, MappedEvent } from './Events';
import Module, { Options as _Options } from './Module';

export { SELECTED_PLAYER, SELECTED_PLAYER_PET };
export type Options = _Options;

export type EventListener<ET extends EventType, E extends MappedEvent<ET>> = (event: E) => void;

class EventSubscriber extends Module {
  addEventListener<ET extends EventType, E extends MappedEvent<ET>>(
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
