import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

class ArchimondesHatredReborn extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.ARCHIMONDES_HATRED_REBORN.id);
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ARCHIMONDES_HATRED_REBORN_ABSORB.id) {
      this.healing += event.amount;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ARCHIMONDES_HATRED_REBORN_DAMAGE.id) {
      this.damage += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.ARCHIMONDES_HATRED_REBORN,
      result: (
        <dfn data-tip={`The effective absorb and damage contributed by Archimode's Hatred Reborn.<br/>
              Damage: ${this.owner.formatItemDamageDone(this.damage)} <br/>
              Absorb: ${this.owner.formatItemHealingDone(this.healing)}`}
        >
          {this.owner.formatItemHealingDone(this.healing)}
        </dfn>
      ),
    };
  }
}

export default ArchimondesHatredReborn;
