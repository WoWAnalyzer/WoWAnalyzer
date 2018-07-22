import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import ItemManaGained from 'Interface/Others/ItemManaGained';

const debug = false;

class InnerHallation extends Analyzer {
  manaGained = 0;

  // timestamp for power infusion if its talented & casted (to exclude mana saved):
  lastPowerInfusionCastStartTimestamp = null;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasShoulder(ITEMS.INNER_HALLATION.id);
  }

  on_byPlayer_cast(event) {
    if (this.selectedCombatant.hasTalent(SPELLS.POWER_INFUSION_TALENT.id) && event.ability.guid === SPELLS.POWER_INFUSION_TALENT.id) {
      this.lastPowerInfusionCastStartTimestamp = event.timestamp;
    } else if (this.selectedCombatant.hasBuff(SPELLS.POWER_INFUSION_TALENT.id) && (event.timestamp + 20000) > this.lastPowerInfusionCastStartTimestamp) {
      const spellId = event.ability.guid;
      const manaCost = event.manaCost;
      if (!manaCost) {
        return;
      }

      const manaSaved = Math.floor(manaCost / 3);

      if (!event.isManaCostNullified) {
        this.manaGained += manaSaved;
        debug && console.log('Inner Hallation saved', manaSaved, 'mana on', SPELLS[spellId].name, ', normally costing', manaCost, event);
      } else {
        debug && console.log('Inner Hallation saved 0 mana on', SPELLS[spellId].name, 'costing', manaCost, 'since Innervate or Symbol of Hope is active (normally ', manaSaved, ' mana)', event);
      }
    }
  }

  item() {
    const manaGained = this.manaGained || 0;

    return {
      item: ITEMS.INNER_HALLATION,
      result: <ItemManaGained amount={manaGained} />,
    };
  }
}

export default InnerHallation;
