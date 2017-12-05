import React from 'react';
import { formatThousands, formatPercentage, formatNumber } from 'common/format';

import CoreGarothiFeedbackConduit from 'Parser/Core/Modules/Items/GarothiFeedbackConduit';
import STAT from "Parser/Core/Modules/Features/STAT";
import HealingDone from 'Parser/Core/Modules/HealingDone';
import ITEMS from 'common/ITEMS';
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
          {formatThousands(avgHaste)} average haste rating gained.<br />
          {formatPercentage(healing / this.healingDone.total.effective)} % / {formatNumber(healing / this.owner.fightDuration * 1000)} HPS <br />
        </dfn>
      ),
    };
  }
}

export default GarothiFeedbackConduit;
