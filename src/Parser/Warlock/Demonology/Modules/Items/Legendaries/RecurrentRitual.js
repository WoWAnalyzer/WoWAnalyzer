import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import SoulShardTracker from '../../SoulShards/SoulShardTracker';

class RecurrentRitual extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.RECURRENT_RITUAL.id);
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
