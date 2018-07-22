import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Abilities from 'Parser/Core/Modules/Abilities';

import ItemHealingDone from 'Interface/Others/ItemHealingDone';

/**
 * Revitalizing Voodoo Totem -
 * Use: Heals the target for 0 every 0.5 sec, stacking up to 12 times. Healing starts low and increases over the duration. (1 Min, 30 Sec Cooldown)
 */
class RevitalizingVoodooTotem extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };


  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.REVITALIZING_VOODOO_TOTEM.id);

    if (this.active) {
      this.abilities.add({
        spell: SPELLS.TOUCH_OF_THE_VOODOO,
        buffSpellId: SPELLS.TOUCH_OF_THE_VOODOO.id,
        name: ITEMS.REVITALIZING_VOODOO_TOTEM.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.TOUCH_OF_THE_VOODOO.id) {
      return;
    }

    this.healing += event.amount + (event.absorbed || 0);
  }

  item() {
    return {
      item: ITEMS.REVITALIZING_VOODOO_TOTEM,
      result: <ItemHealingDone amount={this.healing} />,
    };
  }
}

export default RevitalizingVoodooTotem;
