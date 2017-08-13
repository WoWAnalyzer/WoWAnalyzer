import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';

class Module {
  /** @var CombatLogParser */
  owner = null;
  /** @var boolean Whether or not this module is active, usually depends on specific items or talents. */
  active = true;
  /** @var number This module's execution priority, can be raised for modules altering events so they're executed before others. */
  priority = 0;
  /**
   * @param {CombatLogParser} parser
   */
  constructor(parser) {
    this.owner = parser;
  }

  // Override these with functions that return info about their rendering in the specific slots
  item() { return undefined; }
  statistic() { return undefined; }
  statisticOrder = STATISTIC_ORDER.DEFAULT;
  suggestions(when) { return undefined; }
  tab() { return undefined; }
}

export default Module;
