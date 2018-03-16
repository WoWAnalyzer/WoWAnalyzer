import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import CoreDecieversGrandDesign from 'Parser/Core/Modules/Items/Legion/TombOfSargeras/DeceiversGrandDesign';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';
import Abilities from 'Parser/Core/Modules/Abilities';

import CooldownThroughputTracker from '../Features/CooldownThroughputTracker';

class DecieversGrandDesign extends CoreDecieversGrandDesign {
  static dependencies = {
    combatants: Combatants,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };

  item() {
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.GUIDING_HAND.id);
    const avgDurationDisplay = !this.averageDuration ? `N/A` : `${(this.averageDuration / 1000).toFixed(0)}s`;
    return {
      item: ITEMS.DECEIVERS_GRAND_DESIGN,
      result: (
        <dfn data-tip={`Healing breakdown:
        <ul>
          <li>HoT: <b>${this.owner.formatItemHealingDone(this.healingHot)}</b></li>
          <li>HoT Feeding: <b>${this.owner.formatItemHealingDone(feeding)}</b></li>
          <li>Shield Proc: <b>${this.owner.formatItemHealingDone(this.healingAbsorb)}</b></li>
        </ul>
        Casts: <b>${this.casts.length}</b><br>
        Average Duration: <b>${avgDurationDisplay}</b><br>
        Cast Detail:
        <ul>
          ${this.casts.reduce((arr, cast) => {
            let castResult = ` -> `;
            if (!cast.active) {
              if (cast.shieldProc) {
                castResult += `procced after ${(cast.duration / 1000).toFixed(0)}s`;
              } else {
                castResult += `expired naturally`;
              }
            } else {
              castResult += `fight ended`;
            }
            return arr + `<li>on ${cast.targetName} @${this.owner.formatTimestamp(cast.applied)}${castResult}</li>`;
          }, '')}
        </ul>
        `}>
          <ItemHealingDone amount={this.totalHealing+feeding} />
        </dfn>
      ),
    };
  }
}

export default DecieversGrandDesign;
