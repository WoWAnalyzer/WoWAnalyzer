import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatThousands } from 'common/format';

import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';


const debug = false;

class InnerHallation extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  manaGained = 0;

  // timestamp for power infusion if its talented & casted (to exclude mana saved):
  lastPowerInfusionCastStartTimestamp = null;

  on_initialized() {
    const selectedCombatant = this.owner.modules.combatants.selected;
    this.active = selectedCombatant.hasShoulder(ITEMS.INNER_HALLATION.id);
  }

  on_byPlayer_cast(event) {
    if (this.owner.modules.combatants.selected.hasTalent(SPELLS.POWER_INFUSION_TALENT.id) && event.ability.guid === SPELLS.POWER_INFUSION_TALENT.id) {
      this.lastPowerInfusionCastStartTimestamp = event.timestamp;
    } else if (this.owner.modules.combatants.selected.hasBuff(SPELLS.POWER_INFUSION_TALENT.id) && (event.timestamp + 20000) > this.lastPowerInfusionCastStartTimestamp) {
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
      result: (
        <dfn>
          {formatThousands(manaGained)} mana saved ({formatThousands(manaGained / this.owner.fightDuration * 1000 * 5)} MP5)
        </dfn>
      ),
    };
  }
}

export default InnerHallation;
