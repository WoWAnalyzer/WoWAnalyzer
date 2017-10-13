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

	possibleCasts = 0;
  actualCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SHARD_OF_THE_EXODAR.id);
  }

  on_toPlayer_applybuff(event) {
    if (BLOODLUST_BUFFS.some(buff => event.ability.guid === buff)) {
      this.actualCasts += 1;
    }
  }

  item() {
    if (this.owner.fightDuration / 1000 > 330) {
      this.possibleCasts = 3;
    } else {
      this.possibleCasts = 2;
    }
    return {
      item: ITEMS.SHARD_OF_THE_EXODAR,
      result: `Gained Lust ${formatNumber(this.actualCasts)} Times. (${formatNumber(this.possibleCasts)} Possible)`,
    };
  }
}

export default ShardOfTheExodar;
