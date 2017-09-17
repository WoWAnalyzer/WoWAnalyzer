import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';

class Module {
  static dependencies = {};

  /** @var CombatLogParser */
  owner = null;
  /** @var boolean Whether or not this module is active, usually depends on specific items or talents. */
  active = true;
  /** @var number This module's execution priority, this makes sure dependencies are executed before modules that depend on them. */
  priority = 0;
  /**
   * @param {CombatLogParser} parser
   * @param {object} dependencies
   * @param {int} priority
   */
  constructor(parser, dependencies, priority) {
    this.owner = parser;
    this.priority = priority;

    if (dependencies) {
      Object.keys(dependencies).forEach(key => {
        this[key] = dependencies[key];
      });
    }
  }

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

  /**
   * The combatlog has a lot of issues with the order of events. You can use this to fix this order.
   * Caution: advanced usage, this should only be used as an exception.
   * @param {Array} events
   * @returns {Array}
   */
  reorderEvents(events) {
    return events;
  }

  // Override these with functions that return info about their rendering in the specific slots
  item() { return undefined; }
  statistic() { return undefined; }
  statisticOrder = STATISTIC_ORDER.DEFAULT;
  suggestions(when) { return undefined; }
  tab() { return undefined; }
}

export default Module;
