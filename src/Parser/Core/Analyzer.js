import { formatMilliseconds } from 'common/format';
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';
import Module from './Module';

const EVENT_LISTENER_REGEX = /on_((by|to)Player(Pet)?_)?(.+)/;

class Analyzer extends Module {
  static __dangerousInvalidUsage = false;

  /**
   * Called when the parser finished initializing; after all required dependencies are loaded, normalizers have ran and combatants were initialized.
   * Use this method to toggle the module on/off based on having items equipped, talents selected, etc.
   */
  constructor(...args) {
    super(...args);

    const methods = this.constructor.getAllChildMethods(this);
    // Check for any methods that match the old magic method names and connect them to the new event listeners
    // Based on https://github.com/xivanalysis/xivanalysis/blob/a24b9c0ed8b341cbb8bd8144a772e95a08541f8d/src/parser/core/Module.js#L51
    methods.forEach(name => {
      const match = EVENT_LISTENER_REGEX.exec(name);
      if (!match) {
        return;
      }
      const [listener, , playerFilter, pet, eventType] = match;

      this.addEventListener(eventType, event => {
        if (playerFilter === 'by') {
          if (pet) {
            if (!this.owner.byPlayerPet(event)) {
              return;
            }
          } else {
            if (!this.owner.byPlayer(event)) {
              return;
            }
          }
        } else if (playerFilter === 'to') {
          if (pet) {
            if (!this.owner.toPlayerPet(event)) {
              return;
            }
          } else {
            if (!this.owner.toPlayer(event)) {
              return;
            }
          }
        }

        this[listener].call(this, event);
      });
    });
  }

  _eventListeners = {};
  addEventListener(eventType, listener) {
    // DO NOT MANUALLY CALL THIS METHOD YET. The API is not locked down yet. The current implementation is merely here for an initial performance boost (32%!!!), the final implementation will have more options and performance improvements.
    const existingEventListener = this._eventListeners[eventType];
    this._eventListeners[eventType] = existingEventListener ? function (...args) {
      existingEventListener.apply(this, args);
      listener.apply(this, args);
    } : listener;
  }
  /**
   * Get a list of all methods of all classes in the prototype chain until this class.
   * Orginal source: https://stackoverflow.com/a/40577337/684353
   * @param {object} obj A class instance
   * @returns {Set<any>}
   */
  static getAllChildMethods(obj) {
    // Set is required here to avoid duplicate methods (if a class extends another it might redeclare the same method)
    const methods = new Set();
    // eslint-disable-next-line no-cond-assign
    while ((obj = Reflect.getPrototypeOf(obj)) && obj !== Analyzer.prototype) {
      const keys = Reflect.ownKeys(obj);
      keys.forEach(k => methods.add(k));
    }
    return methods;
  }

  triggerEvent(event) {
    const listener = this._eventListeners[event.type];
    if (listener) {
      listener.call(this, event);
    }
    if (this._eventListeners.event) {
      this._eventListeners.event.call(this, event);
    }
    // // Triggering a lot of events here for development pleasure; does this have a significant performance impact?
    // this._callMethod(this._eventHandlerName('event'), event.type, event);
    // this._callMethod(this._eventHandlerName(event.type), event);
    // if (this.owner && this.owner.byPlayer(event)) {
    //   this._callMethod(this._eventHandlerName(`byPlayer_${event.type}`), event);
    // }
    // if (this.owner && this.owner.toPlayer(event)) {
    //   this._callMethod(this._eventHandlerName(`toPlayer_${event.type}`), event);
    // }
    // if (this.owner && this.owner.byPlayerPet(event)) {
    //   this._callMethod(this._eventHandlerName(`byPlayerPet_${event.type}`), event);
    // }
    // if (this.owner && this.owner.toPlayerPet(event)) {
    //   this._callMethod(this._eventHandlerName(`toPlayerPet_${event.type}`), event);
    // }
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

  get consoleMeta() {
    const fightDuration = formatMilliseconds(this.owner.currentTimestamp - this.owner.fight.start_time);
    return [fightDuration, this.constructor.name];
  }
  debug(...args) {
    console.log(...this.consoleMeta, ...args);
  }
  error(...args) {
    console.error(...this.consoleMeta, ...args);
  }

  // Override these with functions that return info about their rendering in the specific slots
  item() { return undefined; }
  statistic() { return undefined; }
  statisticOrder = STATISTIC_ORDER.DEFAULT;
  suggestions(when) { return undefined; }
  tab() { return undefined; }
}

export default Analyzer;
