import EventFilter, {
  SELECTED_PLAYER,
  SELECTED_PLAYER_PET,
} from './EventFilter';
import Module from './Module';
import { Event } from './Events';

export { SELECTED_PLAYER, SELECTED_PLAYER_PET };

export type EventListener<T extends Event> = (event: T) => void;

class EventSubscriber extends Module {
  addEventListener<T extends Event>(
    eventFilter: T['type'] | EventFilter<T['type']>,
    listener: EventListener<T>,
  ) {
    if (!this.active) {
      return;
    }
    this.owner.addEventListener(eventFilter, listener.bind(this), this);
  }
}

export default EventSubscriber;
