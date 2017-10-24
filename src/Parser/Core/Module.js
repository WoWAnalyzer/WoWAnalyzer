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
    if (new.target === Module) {
      throw new TypeError('The class Module can not be instanced directly, you probably want to use Analyzer instead.');
    }

    this.owner = parser;
    this.priority = priority;

    if (dependencies) {
      Object.keys(dependencies).forEach((key) => {
        this[key] = dependencies[key];
      });
    }
  }
}

export default Module;
