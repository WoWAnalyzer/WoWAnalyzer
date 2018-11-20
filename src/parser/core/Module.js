import { formatMilliseconds } from 'common/format';

class Module {
  // This is a flag that should only be overwritten by Core classes that provide some type of module, it informs users they have extended the wrong class. You usually want to use Analyzer instead of directly using Module; Module provides no functionality and does not get fed any events.
  static __dangerousInvalidUsage = true;

  static dependencies = {};

  /** @var {CombatLogParser} */
  owner = null;
  /** @var {boolean} Whether or not this module is active, usually depends on specific items or talents. */
  active = true;
  /** @var {number} This module's execution priority, this makes sure dependencies are executed before modules that depend on them. */
  priority = 0;
  /** @var {Combatant} */
  get selectedCombatant() {
    return this.owner.selectedCombatant;
  }
  /**
   * @param {object} options
   */
  constructor({ owner, priority, ...others }) {
    if (this.constructor.__dangerousInvalidUsage) {
      throw new TypeError('The class Module can not be used directly, you probably want to use Analyzer instead.');
    }

    this.owner = owner;
    this.priority = priority;

    // This doesn't set the properties of any class that inherits this class since a parent constructor can't override the values of a child's class properties.
    // See https://github.com/Microsoft/TypeScript/issues/6110 for more info
    Object.keys(others).forEach(key => {
      this[key] = others[key];
    });
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
}

export default Module;
