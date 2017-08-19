import React from 'react';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';
import Module from 'Parser/Core/Module';
import Icon from 'common/Icon';
import { getMagicDescription } from 'common/DamageTypes';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class DamageTaken extends Module {
  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="class_druid" alt="Damage taken" />}
        value={`${formatNumber((this.owner.totalDamageTaken + this.owner.totalOverkill) / this.owner.fightDuration * 1000)} DTPS`}
        label='Damage taken'
        tooltip={`Damage taken breakdown:
            <ul>
              ${Object.keys(this.owner.damageBySchool).reduce((v, x) => {return v+=`<li>${getMagicDescription(x)} damage taken ${formatThousands(this.owner.damageBySchool[x])} (${formatPercentage(this.owner.damageBySchool[x]/this.owner.totalDamageTaken)}%)</li>`; }, '')}
            </ul>
            Total damage taken ${formatThousands(this.owner.totalDamageTaken + this.owner.totalOverkill)} (${formatThousands(this.owner.totalOverkill)} overkill)`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(0);
}

export default DamageTaken;
