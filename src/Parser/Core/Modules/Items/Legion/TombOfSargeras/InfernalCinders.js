import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * Infernal Cinders -
 * Equip: Your melee attacks have a chance to deal an additional 82910 Fire damage. The critical strike chance of this damage is increased by 10% for each ally within 10 yds who bears this item.
 */
class InfernalCinders extends Analyzer {
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.INFERNAL_CINDERS.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.INFERNAL_CINDERS.id) {
      this.damage += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.INFERNAL_CINDERS,
      result: <ItemDamageDone amount={this.damage} />,
    };
  }
}

export default InfernalCinders;
