import { formatMilliseconds } from 'common/format';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import EventSubscriber from './EventSubscriber';
import EventFilter from './EventFilter';

const EVENT_LISTENER_REGEX = /on_((by|to)Player(Pet)?_)?(.+)/;

export const SELECTED_PLAYER = 1;
export const SELECTED_PLAYER_PET = 2;

/**
 * Get a list of all methods of all classes in the prototype chain until this class.
 * Orginal source: https://stackoverflow.com/a/40577337/684353
 * @param {object} obj A class instance
 * @returns {Set<any>}
 */
function getAllChildMethods(obj) {
  // Set is required here to avoid duplicate methods (if a class extends another it might override the same method)
  const methods = new Set();
  // eslint-disable-next-line no-cond-assign
  while ((obj = Object.getPrototypeOf(obj)) && obj !== Analyzer.prototype) {
    const keys = Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj));
    keys.forEach(k => methods.add(k));
  }
  return methods;
}
function addLegacyEventListenerSupport(object) {
  const methods = getAllChildMethods(object);
  let hasLegacyEventListener = false;
  // Check for any methods that match the old magic method names and connect them to the new event listeners
  // Based on https://github.com/xivanalysis/xivanalysis/blob/a24b9c0ed8b341cbb8bd8144a772e95a08541f8d/src/parser/core/Module.js#L51
  methods.forEach(name => {
    const match = EVENT_LISTENER_REGEX.exec(name);
    if (!match) {
      return;
    }
    const [listener, , playerFilter, pet, eventType] = match;
    const filter = new EventFilter(eventType);

    // This only shows available filters used by the legacy method.
    // For a full list of supported properties see the core CombatLogParser
    let by = 0;
    if (playerFilter === 'by' && !pet) {
      by = by | SELECTED_PLAYER;
    }
    if (playerFilter === 'by' && pet) {
      by = by | SELECTED_PLAYER_PET;
    }
    filter.by(by);
    let to = 0;
    if (playerFilter === 'to' && !pet) {
      to = to | SELECTED_PLAYER;
    }
    if (playerFilter === 'to' && pet) {
      to = to | SELECTED_PLAYER_PET;
    }
    filter.to(to);

    object.addEventListener(filter, object[listener]);
    hasLegacyEventListener = true;
  });
  object.hasLegacyEventListener = hasLegacyEventListener;
}

class Analyzer extends EventSubscriber {
  static __dangerousInvalidUsage = false;
  hasLegacyEventListener = false;

  /**
   * Called when the parser finished initializing; after all required dependencies are loaded, normalizers have ran and combatants were initialized.
   * Use this method to toggle the module on/off based on having items equipped, talents selected, etc.
   */
  constructor(options) {
    super(options);
    addLegacyEventListenerSupport(this);
  }
  addEventListener(eventFilter, listener) {
    if (this.hasLegacyEventListener) {
      throw new Error('You can not combine legacy event listeners with manual event listeners, use only one method.');
    }
    super.addEventListener(eventFilter, listener);
  }

  get consoleMeta() {
    const fightDuration = formatMilliseconds(this.owner.currentTimestamp - this.owner.fight.start_time);
    return [fightDuration, `(module: ${this.constructor.name})`];
  }
  debug(...args) {
    console.debug(...this.consoleMeta, ...args);
  }
  log(...args) {
    console.log(...this.consoleMeta, ...args);
  }
  warn(...args) {
    console.warn(...this.consoleMeta, ...args);
  }
  error(...args) {
    console.error(...this.consoleMeta, ...args);
  }

  // Override these with functions that return info about their rendering in the specific slots
  item() { return undefined; }
  statistic() { return undefined; }
  /**
   * @deprecated Set the `position` property on the Statistic component instead.
   */
  statisticOrder = STATISTIC_ORDER.DEFAULT;
  suggestions(when) { return undefined; }
  tab() { return undefined; }
}

export default Analyzer;
