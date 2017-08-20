import React from 'react';

import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';

class ArchimondesHatredReborn extends Module {
  healing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.ARCHIMONDES_HATRED_REBORN.id);
    }
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId === ITEMS.ARCHIMONDES_HATRED_REBORN.absorbId) {
      this.healing += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.ARCHIMONDES_HATRED_REBORN,
      result: (
        <dfn data-tip={`The total damaged absorbed by Archimonde's Hatred Reborn was ${this.owner.formatItemAbsorbDone(this.healing)}.`} >
        {this.owner.formatItemHealingDone(this.healing)}
        </dfn>
      ),
    };
  }
}

export default ArchimondesHatredReborn;
