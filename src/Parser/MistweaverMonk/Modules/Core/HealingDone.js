import React from 'react';

import { formatThousands, formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class HealingDone extends Module {
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
        value={`${formatNumber(this.owner.totalHealing / this.owner.fightDuration * 1000)} HPS`}
        label="Healing done"
        tooltip={`The total healing done recorded was ${formatThousands(this.owner.totalHealing)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(0);
}

export default HealingDone;
