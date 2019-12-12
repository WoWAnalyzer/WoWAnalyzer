import EventFilter, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from './EventFilter';
import Module from './Module';

export { SELECTED_PLAYER, SELECTED_PLAYER_PET };

class EventSubscriber extends Module {
  addEventListener(eventFilter: string|EventFilter, listener: (event: object) => void) {
    if (!this.active) {
      return;
    }
    this.owner.addEventListener(eventFilter, listener.bind(this), this);
  }
}

export default EventSubscriber;
