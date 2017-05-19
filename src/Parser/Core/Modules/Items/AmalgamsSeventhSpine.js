import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';

class AmalgamsSeventhSpine extends Module {
  manaGained = 0;
  procs = 0;
  applications = 0;
  refreshes = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.AMALGAMS_SEVENTH_SPINE.id);
    }
  }

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FRAGILE_ECHO_ENERGIZE.id) {
      return;
    }

    this.manaGained += event.resourceChange;
    this.procs += 1;
  }
  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FRAGILE_ECHO_BUFF.id) {
      return;
    }

    this.applications += 1;
  }
  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FRAGILE_ECHO_BUFF.id) {
      return;
    }

    this.refreshes += 1;
  }
}

export default AmalgamsSeventhSpine;
