import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
//import getDamageBonus from 'Parser/DeathKnight/Shared/getDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

class ColdHeart extends Analyzer {
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasChest(ITEMS.COLD_HEART.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.COLD_HEART_DEBUFF.id) {
      return;
    }

    this.damage += event.amount + (event.absorbed || 0);
  }

  item() {
    return {
      item: ITEMS.COLD_HEART,
      // removed the flat damage amount to maintain consistency with other legendaries
      result: <ItemDamageDone amount={this.damage} />,
    };
  }
}

export default ColdHeart;
