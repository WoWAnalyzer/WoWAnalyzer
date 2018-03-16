import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import CoreSeaStarOfTheDepthmother from 'Parser/Core/Modules/Items/Legion/TombOfSargeras/SeaStarOfTheDepthmother';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

import CooldownThroughputTracker from '../Features/CooldownThroughputTracker';

class SeaStarOfTheDepthmother extends CoreSeaStarOfTheDepthmother {
  static dependencies = {
    combatants: Combatants,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };

  item() {
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.OCEANS_EMBRACE.id);

    return {
      item: ITEMS.SEA_STAR_OF_THE_DEPTHMOTHER,
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

export default SeaStarOfTheDepthmother;
