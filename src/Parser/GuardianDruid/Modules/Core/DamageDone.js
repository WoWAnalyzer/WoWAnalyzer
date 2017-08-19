import React from 'react';
import { formatThousands, formatNumber } from 'common/format';
import Module from 'Parser/Core/Module';
import Icon from 'common/Icon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class DamageDone extends Module {
  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="class_druid" alt="Damage done" />}
        value={`${formatNumber(this.owner.totalDamageDone / this.owner.fightDuration * 1000)} DPS`}
        label='Damage done'
        tooltip={`The total damage done was ${formatThousands(this.owner.totalDamageDone)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default DamageDone;
