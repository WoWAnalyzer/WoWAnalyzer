import React from 'react';

import ITEMS from 'common/ITEMS';
import { formatPercentage, formatNumber, formatThousands } from 'common/format';

import CoreDarkmoonDeckPromises from 'Parser/Core/Modules/Items/DarkmoonDeckPromises';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import Rejuvenation from '../Core/Rejuvenation';

class DarkmoonDeckPromises extends CoreDarkmoonDeckPromises {
  static dependencies = {
    ...CoreDarkmoonDeckPromises.dependencies,
    healingDone: HealingDone,
    rejuvenation: Rejuvenation,
  };

  // The actual savings
  savings = 0;

  on_byPlayer_cast(event) {
    super.on_byPlayer_cast(event);

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
    const promisesThroughput = (this.savings / rejuvenationManaCost) * oneRejuvenationThroughput;
    return {
      item: ITEMS.DARKMOON_DECK_PROMISES,
      result: (
        <dfn data-tip={`The actual mana gained is ${formatThousands(this.savings + this.manaGained)}. The numbers shown may actually be lower if you did not utilize the promises effect fully, i.e. not needing the extra mana gained.`}>
          {formatThousands(this.savings)} mana saved ({formatThousands(this.savings / this.owner.fightDuration * 1000 * 5)} MP5)<br />
          {formatPercentage(promisesThroughput)}% / {formatNumber((this.healingDone.total.effective * promisesThroughput) / this.owner.fightDuration * 1000)} HPS
        </dfn>
      ),
    };
  }
}

export default DarkmoonDeckPromises;
