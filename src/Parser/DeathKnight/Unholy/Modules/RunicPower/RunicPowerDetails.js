import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';

import RunicPowerBreakdown from './RunicPowerBreakdown';
import RunicPowerTracker from './RunicPowerTracker';

class RunicPowerDetails extends Analyzer {
  static
  dependencies = {
    runicPowerTracker: RunicPowerTracker,
  };

  get rpWasted() {
    return this.runicPowerTracker.rpWasted;
  }

  get rpWastedPercent() {
    return this.rpWasted / this.runicPowerTracker.totalRPGained;
  }

  get efficiencySuggestionThresholds() {
    return {
      actual: 1 - this.rpWastedPercent,
      isLessThan: {
        minor: 0.90,
        average: 0.85,
        major: .80,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.rpWastedPercent).isGreaterThan(this.efficiencySuggestionThresholds.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(`You wasted ${formatPercentage(this.rpWastedPercent)}% of your Runic Power.`)
          .icon('inv_sword_62')
          .actual(`${this.rpWasted} Runic Power Wasted`)
          .recommended(` Wasting less than ${formatPercentage(recommended)}% is recommended. `)
          .regular(this.efficiencySuggestionThresholds.average).major(this.efficiencySuggestionThresholds.major);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="inv_sword_62" />}
        value={`${formatPercentage(this.rpWastedPercent)} %`}
        label="Runic Power Wasted"
        tooltip={`${this.rpWasted} Runic Power Wasted`}
      />

    );
  }

  tab() {
    return {
      title: 'Runic Power Usage',
      url: 'runic-power',
      render: () => (
        <Tab title="Runic Power Usage Breakdown">
          <RunicPowerBreakdown
            rpGeneratedAndWasted={this.runicPowerTracker.generatedAndWasted}
          />
        </Tab>
      ),
    };
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default RunicPowerDetails;
