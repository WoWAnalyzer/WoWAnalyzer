import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';

class ArchimondesHatredReborn extends Module {
  absorb = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.ARCHIMONDES_HATRED_REBORN.id);
    }
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId === ITEMS.ARCHIMONDES_HATRED_REBORN.absorbId) {
      this.absorb += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.ARCHIMONDES_HATRED_REBORN,
      result: this.owner.formatItemAbsorbDone(this.absorb),
    };
  }
}

export default ArchimondesHatredReborn;
