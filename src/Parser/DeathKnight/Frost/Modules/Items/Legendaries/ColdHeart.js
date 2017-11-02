import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

//import getDamageBonus from 'Parser/DeathKnight/Shared/getDamageBonus';


class ColdHeart extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.COLD_HEART.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.COLD_HEART_BUFF.id) {
      return;
    }

    this.damage += event.amount + (event.absorbed || 0);
  }

  item() {
    return {
      item: ITEMS.COLD_HEART,
      result: `${formatNumber(this.damage)} damage - ${this.owner.formatItemDamageDone(this.damage)}`,
    };
  }
}

export default ColdHeart;
