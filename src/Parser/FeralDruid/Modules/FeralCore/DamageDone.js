import React from 'react';
import Icon from 'common/Icon';
import { formatNumber } from 'common/format';

import CoreDamageDone from 'Parser/Core/Modules/DamageDone';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class DamageDone extends CoreDamageDone {
  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="class_druid" alt="DPS stats" />}
        value={`${formatNumber(this.total.effective / this.owner.fightDuration * 1000)} DPS`}
        label="Damage Done"
        tooltip={`The total damage done recorded was ${formatNumber(this.total.effective)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(0);
}

export default DamageDone;
