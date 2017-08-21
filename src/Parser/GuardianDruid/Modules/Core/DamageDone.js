import React from 'react';

import Icon from 'common/Icon';
import { formatThousands, formatNumber } from 'common/format';

import CoreDamageDone from 'Parser/Core/Modules/DamageDone';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class DamageDone extends CoreDamageDone {
  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="class_druid" alt="Damage done" />}
        value={`${formatNumber(this.total.effective / this.owner.fightDuration * 1000)} DPS`}
        label='Damage done'
        tooltip={`The total damage done was ${formatThousands(this.total.effective)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default DamageDone;
