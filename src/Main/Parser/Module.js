class Module {
  /** @var CombatLogParser */
  owner = null;
  active = true;
  /**
   * @param {CombatLogParser} parser
   */
  constructor(parser) {
    this.owner = parser;
  }
}

export default Module;
