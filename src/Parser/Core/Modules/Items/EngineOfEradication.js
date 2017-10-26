import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

class EngineOfEradication extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  uptime = 0;
  damageIncreased = 0;
  bufftime = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.ENGINE_OF_ERADICATION.id);
  }

  lastAppliedTimestamp = null;
  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.DEMONIC_VIGOR.id) {
      this.lastAppliedTimestamp = event.timestamp;
    }
  }
  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.DEMONIC_VIGOR.id) {
      this.uptime += event.timestamp - this.lastAppliedTimestamp;
      this.lastAppliedTimestamp = null;
    }
  }
  on_finished() {
    if (this.lastAppliedTimestamp) {
      this.uptime += this.owner.fight.end_time - this.lastAppliedTimestamp;
    }
  }
  item() {
    return {
      item: ITEMS.ENGINE_OF_ERADICATION,
      result: `${formatPercentage((this.uptime / this.owner.fightDuration) || 0)} % uptime`,
    };
  }
}

export default EngineOfEradication;
