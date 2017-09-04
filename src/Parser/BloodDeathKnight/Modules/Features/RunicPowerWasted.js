import React from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';
import Module from 'Parser/Core/Module';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';


class RPWasted extends Module {
  totalRPWasted = 0;
  totalRPGained = 0;

  on_byPlayer_energize(event) {
    if (event.resourceChangeType !== RESOURCE_TYPES.RUNIC_POWER) {
      return;
    }

    this.totalRPWasted+=event.waste;
    this.totalRPGained += event.resourceChange + event.waste;
  }

  statistic() {

    return (
      <StatisticBox
        icon={<Icon icon="inv_sword_62" />}
        value={`${formatPercentage(this.totalRPWasted/this.totalRPGained)} %`}
        label='Runic Power Wasted'
        tooltip={''}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);

}
export default RPWasted;
