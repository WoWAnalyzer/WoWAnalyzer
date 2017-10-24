// Half the reason to name this "BaseModule" is so it doesn't appear in auto completion when typing "Module".
class BaseModule {
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
    if (new.target === BaseModule) {
      throw new TypeError('The class BaseModule can not be instanced directly');
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

export default BaseModule;
