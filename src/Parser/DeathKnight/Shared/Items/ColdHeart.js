import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
//import getDamageBonus from 'Parser/DeathKnight/Shared/getDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

class ColdHeart extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.COLD_HEART.id);
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
