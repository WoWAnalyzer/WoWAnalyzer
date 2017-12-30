import React from 'react';

import ITEMS from 'common/ITEMS';
import { formatThousands } from 'common/format';
import Wrapper from 'common/Wrapper';
import CoreCarafeOfSearingLight from 'Parser/Core/Modules/Items/Legion/AntorusTheBurningThrone/CarafeOfSearingLight';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import ItemManaGained from 'Main/ItemManaGained';
import ItemHealingDone from 'Main/ItemHealingDone';

import Rejuvenation from '../Core/Rejuvenation';

class CarafeOfSearingLight extends CoreCarafeOfSearingLight {
  static dependencies = {
    ...CarafeOfSearingLight.dependencies,
    healingDone: HealingDone,
    rejuvenation: Rejuvenation,
  };

  // The actual savings
  savings = 0;

  on_byPlayer_cast(event) {
    if (event.classResources && event.classResources[0]) {
      const resource = event.classResources[0];
      const newSavings = this.manaGained;
      const manaLeftAfterCast = resource.amount - resource.cost;
      const savingsUsed = newSavings - manaLeftAfterCast;

      if (savingsUsed > 0) {
        this.manaGained = newSavings - savingsUsed;
        this.savings = this.savings + savingsUsed;
      } else {
        this.manaGained = newSavings;
      }
    }
  }

  item() {
    const rejuvenationManaCost = 22000;
    const oneRejuvenationThroughput = this.owner.getPercentageOfTotalHealingDone(this.rejuvenation.avgRejuvHealing);
    const carafeThroughput = (this.savings / rejuvenationManaCost) * oneRejuvenationThroughput;
    return {
      item: ITEMS.CARAFE_OF_SEARING_LIGHT,
      result: (
        <Wrapper>
          <dfn data-tip={`The actual mana gained is ${formatThousands(this.savings + this.manaGained)}. The numbers shown may actually be lower if you did not utilize the effect fully, i.e. not needing the extra mana gained.`}>
            <ItemManaGained amount={this.savings} />
          </dfn><br />
          <ItemHealingDone amount={this.healingDone.total.effective * carafeThroughput} />
        </Wrapper>
      ),
    };
  }
}

export default CarafeOfSearingLight;
