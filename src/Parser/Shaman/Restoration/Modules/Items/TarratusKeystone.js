import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Combatants from 'Parser/Core/Modules/Combatants';
import CoreTarratusKeystone from 'Parser/Core/Modules/Items/Legion/AntorusTheBurningThrone/TarratusKeystone';
import ItemHealingDone from 'Main/ItemHealingDone';

import CooldownThroughputTracker from '../Features/CooldownThroughputTracker';

/*
 * Tarratus Keystone -
 * Use: Open a portal at an ally's location that releases brilliant light, restoring 1633313 health split amongst injured allies within 20 yds. (1 Min, 30 Sec Cooldown)
 */
class TarratusKeystone extends CoreTarratusKeystone {
  static dependencies = {
      combatants: Combatants,
      cooldownThroughputTracker: CooldownThroughputTracker,
  };

  item() {
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.TARRATUS_KEYSTONE.id);

    return {
      item: ITEMS.TARRATUS_KEYSTONE,
      result: (
        <dfn
          data-tip={`
            Healing
            <ul>
              <li>${this.owner.formatItemHealingDone(this.healing)}</li>
            </ul>
            Feeding
            <ul>
              <li>${this.owner.formatItemHealingDone(feeding)}</li>
            </ul>
          `}
        >
          <ItemHealingDone amount={this.healing+feeding} />
        </dfn>
      ),
    };
  }
}

export default TarratusKeystone;
