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
  get selectedCombatant() {
    return this.owner.selectedCombatant;
  }
  /**
   * @param {CombatLogParser} parser
   * @param {object} dependencies
   * @param {int} priority
   */
  constructor(parser, dependencies, priority) {
    if (this.constructor.__dangerousInvalidUsage) {
      throw new TypeError('The class Module can not be used directly, you probably want to use Analyzer instead.');
    }

    this.owner = parser;
    this.priority = priority;

    if (dependencies) {
      Object.keys(dependencies).forEach(key => {
        this[key] = dependencies[key];
      });
    }
  }
}

export default Module;
