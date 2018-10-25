import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import ItemHealingDone from 'interface/others/ItemHealingDone';

const COASTAL_SURGE_ENCHANT_ID = 5946;
/**
 * Costal Surge:
 * Permanently enchant a weapon to sometimes cause the wielder's helpful spells to put a short heal over time effect on the target for 10 sec.
 */
class CostalSurge extends Analyzer {
  healing = 0;

  constructor(...args) {
    super(...args);
    const item = this.selectedCombatant._getGearItemBySlotId(15);
    this.active = item && item.permanentEnchant === COASTAL_SURGE_ENCHANT_ID;
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.COASTAL_SURGE.id) {
      return;
    }

    this.healing += event.amount + (event.absorbed || 0);
  }


  item() {
    return {
      id: SPELLS.COASTAL_SURGE.id,
      icon: <SpellIcon id={SPELLS.COASTAL_SURGE.id} />,
      title: <SpellLink id={SPELLS.COASTAL_SURGE.id} icon={false} />,
      result: <ItemHealingDone amount={this.healing} />,
    };
  }

}
export default CostalSurge;
