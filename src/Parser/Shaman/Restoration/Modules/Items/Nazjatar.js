import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';

class Nazjatar extends Analyzer {
  resets = 0;

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasWaist(ITEMS.INTACT_NAZJATAR_MOLTING.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (!(spellId === SPELLS.RIPTIDE.id) || event.tick) {
      return;
    }

    const healthBeforeHeal = event.hitPoints - (event.amount || 0) + (event.overheal || 0);
    const healthPercentBeforeHeal = healthBeforeHeal / event.maxHitPoints;

    if (healthPercentBeforeHeal < 0.4) {
      this.resets += 1;
    }
  }

  item() {
    return {
      item: ITEMS.INTACT_NAZJATAR_MOLTING,
      result: (
        <span>
          ${this.resets} Riptide resets
        </span>
      ),
    };
  }
}

export default Nazjatar;
