import Analyzer from './Analyzer';

class ItemAnalyzer extends Analyzer {
  /** @var {number} */
  static itemId = 0;

  get item2() {
    return this.selectedCombatant.getItem(this.constructor.itemId);
  }

  constructor(...args) {
    super(...args);
    this.active = !!this.item2;
  }

  // IMPLEMENTME: statistic() {}
}

export default ItemAnalyzer;
