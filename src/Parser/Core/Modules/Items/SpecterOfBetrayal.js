import React from 'react';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS_OTHERS';
import { formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

class SpecterOfBetrayal extends Module {
  static dependencies = {
    combatants: Combatants,
  };
  damageIncreased = 0;
  totalCast = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.SPECTER_OF_BETRAYAL.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SUMMON_DREAD_REFLECTION.id) {
      this.totalCast += 1;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.DREAD_TORRENT.id) {
      this.damageIncreased += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.SPECTER_OF_BETRAYAL,
      result: (<dfn data-tip={`The effective damage contributed by Specter of Betrayal.<br/>Casts: ${this.totalCast}<br/> Damage: ${this.owner.formatItemDamageDone(this.damageIncreased)}<br/> Total Damage: ${formatNumber(this.damageIncreased)}`}>
          {this.owner.formatItemDamageDone(this.damageIncreased)}
        </dfn>),
    };
  }
}

export default SpecterOfBetrayal;
