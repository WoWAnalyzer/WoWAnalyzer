import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/**
 * Shard of the Exodar:
 * Your Time Warp does not cause Temporal Displacement on yourself and is not affected by Temporal Displacement or similar effects on yourself.
 */
const BLOODLUST_BUFFS = [
  SPELLS.HEROISM.id,
  SPELLS.BLOODLUST.id,
  SPELLS.TIME_WARP.id,
  SPELLS.PRIMAL_RAGE.id,
  SPELLS.DRUMS_OF_FURY.id,
  SPELLS.DRUMS_OF_RAGE.id,
  SPELLS.DRUMS_OF_THE_MOUNTAIN.id,
];

const TEAM_COOLDOWN = 600;
const PERSONAL_COOLDOWN = 300;
const DURATION = 40;

class ShardOfTheExodar extends Analyzer {

  static dependencies = {
		combatants: Combatants,
	};

  actualCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SHARD_OF_THE_EXODAR.id);
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (BLOODLUST_BUFFS.some(buff => spellId === buff)) {
      this.actualCasts += 1;
    }
  }

  on_toPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (BLOODLUST_BUFFS.some(buff => spellId === buff)) {
      this.actualCasts += 1;
    }
  }

  get fightDurationSeconds() {
    return this.owner.fightDuration / 1000;
  }

  get teamCasts() {
    return 1 + Math.floor(this.fightDurationSeconds / TEAM_COOLDOWN);
  }

  get personalCasts() {
    return 1+ Math.floor((this.fightDurationSeconds - DURATION) / PERSONAL_COOLDOWN);
  }

  get possibleCasts() {
    return this.teamCasts + this.personalCasts;
  }

  item() {
    return {
      item: ITEMS.SHARD_OF_THE_EXODAR,
      result: `Gained Time Warp effect ${formatNumber(this.actualCasts)} Times. (${formatNumber(this.possibleCasts)} Possible)`,
    };
  }
}

export default ShardOfTheExodar;
