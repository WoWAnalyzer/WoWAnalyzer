import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS_OTHERS';

import Module from 'Parser/Core/Module';

class EngineOfEradication extends Module {
  uptime = 0;
  damageIncreased = 0;
  bufftime = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.ENGINE_OF_ERADICATION.id);
    }
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
}

export default EngineOfEradication;
