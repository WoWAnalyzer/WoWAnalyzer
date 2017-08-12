import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

class Prydaz extends Module {
  healing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasNeck(ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id);
    }
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.XAVARICS_MAGNUM_OPUS.id) {
      this.healing += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS,
      result: this.owner.formatItemHealingDone(this.healing),
    };
  }
}

export default Prydaz;
