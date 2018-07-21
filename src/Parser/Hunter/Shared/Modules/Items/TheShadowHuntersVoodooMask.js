import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';

/**
 * The Shadow Hunter's Voodoo Mask
 * Heal for 20% of your maximum health when you activate Feign Death then heal for an additional 5% of your maximum health every sec afterwards for 10 sec while still Feigning Death. UPDATE PLEASE
 */
class TheShadowHuntersVoodooMask extends Analyzer {
  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasHead(ITEMS.THE_SHADOW_HUNTERS_VOODOO_MASK.id);

  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.THE_SHADOW_HUNTERS_VOODOO_MASK_HEAL.id) {
      this.healing += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.THE_SHADOW_HUNTERS_VOODOO_MASK,
      result: <ItemHealingDone amount={this.healing} />,
    };
  }
}

export default TheShadowHuntersVoodooMask;
