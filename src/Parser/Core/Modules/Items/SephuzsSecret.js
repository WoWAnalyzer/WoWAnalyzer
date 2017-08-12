import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';

class SephuzsSecret extends Module {
  uptime = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasFinger(ITEMS.SEPHUZS_SECRET.id);
    }
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
