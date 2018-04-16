import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * Terror from Below -
 * Equip: Your ranged attacks and spells have a chance to summon a behemoth from the deep to swallow your target whole, dealing 736021 Nature damage split amongst you and all nearby enemies.
 */
class TerrorFromBelow extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.TERROR_FROM_BELOW.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.TERROR_FROM_BELOW_DAMAGE.id) {
      return;
    }
    // The trinket can damage damage to the player as well if he's near the mobs, count only the damage to enemy targets
    if (!event.targetIsFriendly) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  item() {
    return {
      item: ITEMS.TERROR_FROM_BELOW,
      result: <ItemDamageDone amount={this.damage} />,
    };
  }
}

export default TerrorFromBelow;
