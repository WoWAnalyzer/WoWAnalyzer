import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

class SephuzsSecret extends Module {
  static dependencies = {
    combatants: Combatants,
  };
  uptime = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SEPHUZS_SECRET.id);
  }

  lastAppliedTimestamp = null;
  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SEPHUZS_SECRET_BUFF.id) {
      this.lastAppliedTimestamp = event.timestamp;
    }
  }
  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SEPHUZS_SECRET_BUFF.id) {
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
      item: ITEMS.SEPHUZS_SECRET,
      result: `${formatPercentage((this.uptime / this.owner.fightDuration) || 0)} % uptime`,
    };
  }
}

export default SephuzsSecret;
