import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

class ShardOfExodar extends Module {
	static dependencies = {
		combatants: Combatants,
	};

	LustDamage = 0;
	
  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SHARD_OF_EXODAR.id);
  }

  on_byPlayer_damage(event){
	if (this.combatants.selected.hasBuff(SPELLS.HEROISM.id) || this.combatants.selected.hasBuff(SPELLS.BLOODLUST.id) || this.combatants.selected.hasBuff(SPELLS.TIME_WARP.id) || this.combatants.selected.hasBuff(SPELLS.NETHERWINDS.id) || this.combatants.selected.hasBuff(SPELLS.ANCIENT_HYSTERIA.id) || this.combatants.selected.hasBuff(SPELLS.DRUMS_OF_FURY.id) || this.combatants.selected.hasBuff(SPELLS.DRUMS_OF_RAGE.id) || this.combatants.selected.hasBuff(SPELLS.DRUMS_OF_THE_MOUNTAIN.id)) {
		this.LustDamage += event.amount;
	}
  }
  
  item() {
    return {
      item: ITEMS.SHARD_OF_EXODAR,
      result: `${formatNumber(this.LustDamage)} Total Damage During Lust`,
    };
  }
}

export default ShardOfExodar;