import React from 'react';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS_OTHERS';
import { formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

class InfernalCinders extends Module {
  static dependencies = {
    combatants: Combatants,
  };
  damageIncreased = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.INFERNAL_CINDERS.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.INFERNAL_CINDERS.id) {
      this.damageIncreased += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.INFERNAL_CINDERS,
      result: (<dfn data-tip={`The effective damage contributed by Infernal Cinders.<br/>Damage: ${this.owner.formatItemDamageDone(this.damageIncreased)}<br/> Total Damage: ${formatNumber(this.damageIncreased)}`}>
        {this.owner.formatItemDamageDone(this.damageIncreased)}
      </dfn>),
    };
  }
}

export default InfernalCinders;
