import React from 'react';

import { formatNumber, formatThousands } from 'common/format';
import ITEMS from 'common/ITEMS';
import CoreGarothiFeedbackConduit from 'Parser/Core/Modules/Items/Legion/AntorusTheBurningThrone/GarothiFeedbackConduit';
import STAT from 'Parser/Core/Modules/Features/STAT';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import ItemHealingDone from 'Main/ItemHealingDone';

import StatWeights from '../Features/StatWeights';

class GarothiFeedbackConduit extends CoreGarothiFeedbackConduit {
  static dependencies = {
    ...CoreGarothiFeedbackConduit.dependencies,
    statWeights: StatWeights,
    healingDone: HealingDone,
  };

  item() {
    const avgHaste =
      this.totalProccValue.reduce((acc, proc) => acc + (proc[0] * proc[1]), 0) / this.owner.fightDuration;
    const healing = this.statWeights._getGain(STAT.HASTE_HPM) * avgHaste;

    return {
      item: ITEMS.GAROTHI_FEEDBACK_CONDUIT,
      result: (
        <dfn
          data-tip={`The throughput shown is calculated by using the amount of healing one rating of haste yielded and multiplied with the average haste gained.
            The amount of healing one rating of haste yielded was ${formatNumber(this.statWeights._getGain(STAT.HASTE_HPM))}</b>`}
        >
          <ItemHealingDone amount={healing} /><br />
          {formatThousands(avgHaste)} average haste rating gained
        </dfn>
      ),
    };
  }
}

export default GarothiFeedbackConduit;
