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

const TEAM_COOLDOWN = 600;
const PERSONAL_COOLDOWN = 300;
const DURATION = 40;

class ShardOfTheExodar extends Module {

  static dependencies = {
		combatants: Combatants,
	};

  actualCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SHARD_OF_THE_EXODAR.id);
  }

  on_toPlayer_applybuff(event) {
    if (BLOODLUST_BUFFS.some(buff => event.ability.guid === buff)) {
      this.actualCasts += 1;
    }
  }

  on_toPlayer_refreshbuff(event) {
    if (BLOODLUST_BUFFS.some(buff => event.ability.guid === buff)) {
      this.actualCasts += 1;
    }
  }

  item() {
    const fightInSeconds = this.owner.fightDuration / 1000;
    const teamCasts = 1 + Math.floor(fightInSeconds / TEAM_COOLDOWN);
    const personalCasts = 1 + Math.floor((fightInSeconds - DURATION) / PERSONAL_COOLDOWN);
    const possibleCasts = teamCasts + personalCasts;
    return {
      item: ITEMS.SHARD_OF_THE_EXODAR,
      result: `Gained Time Warp effect ${formatNumber(this.actualCasts)} Times. (${formatNumber(possibleCasts)} Possible)`,
    };
  }
}

export default ShardOfTheExodar;
