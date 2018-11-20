import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import Analyzer from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';

import ItemDamageDone from 'interface/others/ItemDamageDone';

/**
 * My'das Talisman
 * Use: Turn your hands to gold, causing your next 5 auto-attacks to deal X extra damage. (1 Min, 30 Sec Cooldown)
 */
class MydasTalisman extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.MYDAS_TALISMAN.id);

    if (this.active) {
      this.damage = 0;

      this.abilities.add({
        spell: SPELLS.TOUCH_OF_GOLD,
        buffSpellId: SPELLS.TOUCH_OF_GOLD.id,
        name: ITEMS.MYDAS_TALISMAN.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.TOUCH_OF_GOLD_DAMAGE.id) {
      return;
    }

    this.damage += event.amount + (event.absorbed || 0);
  }

  item() {
    return {
      item: ITEMS.MYDAS_TALISMAN,
      result: <ItemDamageDone amount={this.damage} />,
    };
  }
}

export default MydasTalisman;
