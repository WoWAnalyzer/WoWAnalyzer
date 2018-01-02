import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * Vial of Ceaseless Toxins -
 * Use: Inflict 225700 Shadow damage to an enemy in melee range, plus 366752 damage over 20 sec. If they die while this effect is active, the cooldown of this ability is reduced by 45 sec. (1 Min Cooldown)
 */
class VialOfCeaselessToxins extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;
  totalCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.VIAL_OF_CEASELESS_TOXINS.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.CEASELESS_TOXIN.id) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  item() {
    return {
      item: ITEMS.VIAL_OF_CEASELESS_TOXINS,
      result: <ItemDamageDone amount={this.damage} />,
    };
  }
}

export default VialOfCeaselessToxins;
