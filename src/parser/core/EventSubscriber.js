import Module from './Module';
import { SELECTED_PLAYER, SELECTED_PLAYER_PET } from './EventFilter';

export { SELECTED_PLAYER, SELECTED_PLAYER_PET };

class EventSubscriber extends Module {
  /**
   * @param {string|EventFilter} eventFilter
   * @param {function} listener
   */
  addEventListener(eventFilter, listener) {
    if (!this.active) {
      return;
    }
    this.owner.addEventListener(eventFilter, listener.bind(this), this);
  }
}

export default EventSubscriber;
