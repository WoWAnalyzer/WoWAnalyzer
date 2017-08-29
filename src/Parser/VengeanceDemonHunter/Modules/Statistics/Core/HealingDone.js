import React from 'react';

import { formatThousands, formatNumber } from 'common/format';

import CoreHealingDone from 'Parser/Core/Modules/HealingDone';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class HealingDone extends CoreHealingDone {
  statistic() {
    return (
      <StatisticBox
        icon={(
          <img
            src="/img/healing.png"
            style={{ border: 0 }}
            alt="Healing"
          />
        )}
        value={`${formatNumber(this.total.effective / this.owner.fightDuration * 1000)} HPS`}
        label="Healing done"
        tooltip={`The total healing done recorded was ${formatThousands(this.total.effective)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default HealingDone;
