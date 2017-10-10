import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

const BLOODLUST_BUFFS = [
  SPELLS.HEROISM.id,
  SPELLS.BLOODLUST.id,
  SPELLS.TIME_WARP.id,
  SPELLS.NETHERWINDS.id,
  SPELLS.ANCIENT_HYSTERIA.id,
  SPELLS.DRUMS_OF_FURY.id,
  SPELLS.DRUMS_OF_RAGE.id,
  SPELLS.DRUMS_OF_THE_MOUNTAIN.id,
];

class ShardOfTheExodar extends Module {

  static dependencies = {
		combatants: Combatants,
	};

	damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SHARD_OF_THE_EXODAR.id);
  }

  on_byPlayer_damage(event){
    if (BLOODLUST_BUFFS.some(buff => this.combatants.selected.hasBuff(buff, event.timestamp))) {
      this.damage += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.SHARD_OF_THE_EXODAR,
      result: `${this.owner.formatItemDamageDone(this.damage)} Total Damage During Lust`,
    };
  }
}

export default ShardOfTheExodar;
