import Module from './Module';

class EventSubscriber extends Module {
  static __dangerousInvalidUsage = false;

  /**
   * @param {string|EventFilter} eventFilter
   * @param {function} listener
   */
  addEventListener(eventFilter, listener) {
    this.owner.addEventListener(eventFilter, listener.bind(this), this);
  }
}

export default EventSubscriber;
