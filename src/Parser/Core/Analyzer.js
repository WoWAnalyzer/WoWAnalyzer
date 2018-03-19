import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';
import Module from './Module';

class Analyzer extends Module {
  static __dangerousInvalidUsage = false;

  triggerEvent(event, ...args) {
    // Triggering a lot of events here for development pleasure; does this have a significant performance impact?
    this._callMethod(this._eventHandlerName('event'), event.type, event, ...args);
    this._callMethod(this._eventHandlerName(event.type), event, ...args);
    if (this.owner && this.owner.byPlayer(event)) {
      this._callMethod(this._eventHandlerName(`byPlayer_${event.type}`), event, ...args);
    }
    if (this.owner && this.owner.toPlayer(event)) {
      this._callMethod(this._eventHandlerName(`toPlayer_${event.type}`), event, ...args);
    }
    if (this.owner && this.owner.byPlayerPet(event)) {
      this._callMethod(this._eventHandlerName(`byPlayerPet_${event.type}`), event, ...args);
    }
    if (this.owner && this.owner.toPlayerPet(event)) {
      this._callMethod(this._eventHandlerName(`toPlayerPet_${event.type}`), event, ...args);
    }
  }
  _eventHandlerName(eventType) {
    return `on_${eventType}`;
  }
  _callMethod(methodName, ...args) {
    const method = this[methodName];
    if (method) {
      method.call(this, ...args);
    }
  }

  // Common event handler shells so that implementors can always properly call `super`
  on_initialized() {}

  // Override these with functions that return info about their rendering in the specific slots
  item() { return undefined; }
  statistic() { return undefined; }
  statisticOrder = STATISTIC_ORDER.DEFAULT;
  suggestions(when) { return undefined; }
  tab() { return undefined; }
}

export default Analyzer;
