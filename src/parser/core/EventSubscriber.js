import Module from './Module';

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
