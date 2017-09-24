import React from 'react';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS_OTHERS';
import { formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

class UmbralMoonglaives extends Module {
  static dependencies = {
    combatants: Combatants,
  };
  damageIncreased = 0;
  totalCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.UMBRAL_MOONGLAIVES.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.UMBRAL_GLAIVE_STORM.id) {
      this.totalCasts += 1;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.UMBRAL_GLAIVE_STORM.id || spellId === SPELLS.SHATTERING_UMBRAL_GLAIVES.id) {
      this.damageIncreased += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.UMBRAL_MOONGLAIVES,
      result: (<dfn data-tip={`The effective damage contributed by Umbral Moonglaives.<br/>Casts: ${this.totalCasts}<br/> Damage: ${this.owner.formatItemDamageDone(this.damageIncreased)}<br/> Total Damage: ${formatNumber(this.damageIncreased)}`}>
        {this.owner.formatItemDamageDone(this.damageIncreased)}
      </dfn>),
    };
  }
}

export default UmbralMoonglaives;
