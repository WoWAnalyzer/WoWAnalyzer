import React from 'react';

import Module from 'Parser/Core/Module';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';

import RunicPowerBreakdown from './RunicPowerBreakdown';
import RunicPowerTracker from './RunicPowerTracker';

class RunicPowerDetails extends Module {
  static
  dependencies = {
    runicPowerTracker: RunicPowerTracker,
  };

  suggestions(when) {
    const rpWasted = this.runicPowerTracker.rpWasted;
    const rpWastedPercent = rpWasted / this.runicPowerTracker.totalRPGained;
    const MINOR = 0.05; //5%
    const AVG = 0.1; //10%
    const MAJOR = 0.15; //15%
    when(rpWastedPercent).isGreaterThan(MINOR)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(`You wasted ${formatPercentage(rpWastedPercent)}% of your Runic Power.`)
          .icon('inv_sword_62')
          .actual(`${rpWasted} Runic Power Wasted`)
          .recommended(` Wasting less than ${formatPercentage(recommended)}% is recommended. `)
          .regular(AVG).major(MAJOR);
      });
  }

  statistic() {
    const rpWasted = this.runicPowerTracker.rpWasted;
    const totalRPGained = this.runicPowerTracker.totalRPGained;
    return (
      <StatisticBox
        icon={<Icon icon='inv_sword_62'/>}
        value={`${formatPercentage(rpWasted / totalRPGained)} %`}
        label='Runic Power Wasted'
        tooltip={`${rpWasted} Runic Power Wasted`}
      />

    );
  }

  tab() {
    return {
      title: 'Runic Power Usage',
      url: 'runic-power',
      render: () => (
        <Tab title='Runic Power Usage Breakdown'>
          <RunicPowerBreakdown
            rpGeneratedAndWasted = {this.runicPowerTracker.generatedAndWasted}
          />
        </Tab>
      ),
    };
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default RunicPowerDetails;
