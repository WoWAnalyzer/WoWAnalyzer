import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import SoulShardTracker from '../../SoulShards/SoulShardTracker';

class RecurrentRitual extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasShoulder(ITEMS.RECURRENT_RITUAL.id);
  }

  item() {
    const shardsGained = this.soulShardTracker.generatedAndWasted[SPELLS.RECURRENT_RITUAL_SHARD_GEN.id].generated;
    return {
      item: ITEMS.RECURRENT_RITUAL,
      result: `${shardsGained} Soul Shard Fragments gained`,
    };
  }
}

export default RecurrentRitual;
