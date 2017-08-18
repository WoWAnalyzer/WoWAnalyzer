import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS_OTHERS';

import Module from 'Parser/Core/Module';

class SpecterOfBetrayal extends Module {
  damageIncreased = 0;
  totalCast = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.SPECTER_OF_BETRAYAL.id);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SUMMON_DREAD_REFLECTION.id) {
      this.totalCast++;
      return;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.DREAD_TORRENT.id) {
      this.damageIncreased += event.amount;
    }
  }
}

export default SpecterOfBetrayal;
