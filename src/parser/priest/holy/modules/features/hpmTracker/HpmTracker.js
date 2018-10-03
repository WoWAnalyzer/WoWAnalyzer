import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellUsable from 'parser/core/modules/SpellUsable';
import Analyzer from 'parser/core/Analyzer';

class HpmTracker extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.MANA;
    this.maxResource = 100000;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
  }
}

export default HpmTracker;
