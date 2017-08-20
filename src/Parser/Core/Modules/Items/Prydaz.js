import React from 'react';

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
      result: (
        <dfn data-tip={`The total damaged absorbed by Archimonde's Hatred Reborn was ${this.owner.formatItemAbsorbDone(this.healing)}.`} >
        {this.owner.formatItemHealingDone(this.healing)}
        </dfn>
      ),
    };
  }
}

export default Prydaz;
