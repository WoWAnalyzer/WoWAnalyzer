import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import SharedEmpoweredLifeTap from '../../../Shared/Modules/Talents/EmpoweredLifeTap';

class EmpoweredLifeTap extends SharedEmpoweredLifeTap {
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EMPOWERED_LIFE_TAP_TALENT.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Empowered Life Tap uptime"
        tooltip={`Your Empowered Life Tap talent contributed ${formatNumber(this.bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} %)`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(1);
}

export default EmpoweredLifeTap;
