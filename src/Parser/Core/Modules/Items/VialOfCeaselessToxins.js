import React from 'react';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS_OTHERS';
import { formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

class VialOfCeaselessToxins extends Module {
  static dependencies = {
    combatants: Combatants,
  };
  damageIncreased = 0;
  totalCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.VIAL_OF_CEASELESS_TOXINS.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.CEASELESS_TOXIN.id) {
      this.totalCasts++;
      return;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.CEASELESS_TOXIN.id) {
      this.damageIncreased += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.VIAL_OF_CEASELESS_TOXINS,
      result: (<dfn data-tip={`The effective damage contributed by Vial of Ceaseless Toxins.<br/>Casts: ${this.totalCasts}<br/> Damage: ${this.owner.formatItemDamageDone(this.damageIncreased)}<br/> Total Damage: ${formatNumber(this.damageIncreased)}`}>
          {this.owner.formatItemDamageDone(this.damageIncreased)}
        </dfn>),
    };
  }
}

export default VialOfCeaselessToxins;
