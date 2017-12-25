import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import ITEMS from 'common/ITEMS';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';

/*
 * The Shadow Hunter's Voodoo Mask
 * Heal for 20% of your maximum health when you activate Feign Death then heal for an additional 5% of your maximum health every sec afterwards for 10 sec while still Feigning Death. UPDATE PLEASE
 */

class TheShadowHuntersVoodooMask extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasHead(ITEMS.THE_SHADOW_HUNTERS_VOODOO_MASK.id);

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
      result: this.owner.formatItemHealingDone(this.healing),
    };
  }

}

export default TheShadowHuntersVoodooMask;
