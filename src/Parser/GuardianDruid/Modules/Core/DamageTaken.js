import React from 'react';
import { formatThousands, formatNumber, formatPercentage } from 'common/format';
import MainDamageTaken from 'Parser/Core/Modules/DamageTaken';
import Icon from 'common/Icon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class DamageTaken extends MainDamageTaken {
  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="class_druid" alt="Damage taken" />}
        value={`${formatNumber(this.TotalDamage.Total / this.owner.fightDuration * 1000)} DTPS`}
        label='Damage taken'
        tooltip={`Damage taken breakdown:
            <ul>
              ${Object.keys(this.DamageBySchool).reduce((v, type) => {
                return v+=`<li>${type} damage taken ${formatThousands(this.DamageBySchool[type].Total)} (${formatPercentage(this.DamageBySchool[type].Total/this.TotalDamage.Total)}%)</li>`; 
              }, '')}
            </ul>
            Total damage taken ${formatThousands(this.TotalDamage.Total)} (${formatThousands(this.TotalDamage.Overkill)} overkill)`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(0);
}

export default DamageTaken;
