import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';
import Module from './Module';

class Analyzer extends Module {
  static __dangerousInvalidUsage = false;

  triggerEvent(eventType, event, ...args) {
    this._callMethod(this._eventHandlerName('event'), eventType, event, ...args);
    this._callMethod(this._eventHandlerName(eventType), event, ...args);
    if (event && this.owner.byPlayer(event)) {
      this._callMethod(this._eventHandlerName(`byPlayer_${eventType}`), event, ...args);
    }
    if (event && this.owner.toPlayer(event)) {
      this._callMethod(this._eventHandlerName(`toPlayer_${eventType}`), event, ...args);
    }
    if (event && this.owner.byPlayerPet(event)) {
      this._callMethod(this._eventHandlerName(`byPlayerPet_${eventType}`), event, ...args);
    }
    if (event && this.owner.toPlayerPet(event)) {
      this._callMethod(this._eventHandlerName(`toPlayerPet_${eventType}`), event, ...args);
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

  // Override these with functions that return info about their rendering in the specific slots
  item() { return undefined; }
  statistic() { return undefined; }
  statisticOrder = STATISTIC_ORDER.DEFAULT;
  suggestions(when) { return undefined; }
  tab() { return undefined; }
}

export default Analyzer;
