import { formatMilliseconds } from 'common/format';
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';
import Module from './Module';

const EVENT_LISTENER_REGEX = /on_((by|to)Player(Pet)?_)?([^_]+)/;
/**
 * Get a list of all methods of all classes in the prototype chain, all the way to object.
 * @param obj
 * @returns {Set<any>}
 */
function getAllMethodNames(obj) {
  const methods = new Set();
  // eslint-disable-next-line no-cond-assign
  while ((obj = Reflect.getPrototypeOf(obj)) && obj !== Object.prototype) {
    const keys = Reflect.ownKeys(obj);
    keys.forEach((k) => methods.add(k));
  }
  return methods;
}

class Analyzer extends Module {
  static __dangerousInvalidUsage = false;

  /**
   * Called when the parser finished initializing; after all required dependencies are loaded, normalizers have ran and combatants were initialized.
   * Use this method to toggle the module on/off based on having items equipped, talents selected, etc.
   */
  constructor(...args) {
    super(...args);

    const methods = getAllMethodNames(this);
    // Check for any methods that match the old magic method names and connect them to the new event listeners
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
