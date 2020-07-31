import EventFilter, {
  SELECTED_PLAYER,
  SELECTED_PLAYER_PET,
} from './EventFilter';
import Module from './Module';
import { Event } from './Events';

export { SELECTED_PLAYER, SELECTED_PLAYER_PET };

export type EventListener<ET extends string, E extends Event<ET>> = (event: E) => void;

class EventSubscriber extends Module {
  addEventListener<ET extends string, E extends Event<ET>>(
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
