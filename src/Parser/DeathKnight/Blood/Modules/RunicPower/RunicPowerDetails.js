import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import Icon from 'common/Icon';
import ResourceBreakdown from 'Parser/Core/Modules/ResourceTracker/ResourceBreakdown';

import RunicPowerTracker from './RunicPowerTracker';

class RunicPowerDetails extends Analyzer {
  static dependencies = {
    runicPowerTracker: RunicPowerTracker,
  };

  get wastedPercent(){
    return this.runicPowerTracker.wasted / (this.runicPowerTracker.wasted + this.runicPowerTracker.generated) || 0;
  }

  get efficiencySuggestionThresholds() {
    return {
      actual: 1 - this.wastedPercent,
      isLessThan: {
        minor: 0.90,
        average: 0.85,
        major: .80,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholds() {
    return {
      actual: this.wastedPercent,
      isLessThan: {
        minor: 0.1,
        average: 0.15,
        major: .2,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(`You wasted ${formatPercentage(this.wastedPercent)}% of your Runic Power.`)
          .icon('inv_sword_62')
          .actual(`${this.rpWasted}% wasted`)
          .recommended(`<${formatPercentage(recommended)}% is recommended. `);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="inv_sword_62" />}
        value={`${formatPercentage(this.wastedPercent)} %`}
        label="Runic Power wasted"
        tooltip={`${this.runicPowerTracker.wasted} out of ${this.runicPowerTracker.wasted + this.runicPowerTracker.generated} runic power wasted.`}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);

  tab() {
    return {
      title: 'Runic Power usage',
      url: 'runic-power-usage',
      render: () => (
        <Tab title="Runic Power usage breakdown">
          <ResourceBreakdown
            tracker={this.runicPowerTracker}
            showSpenders={true}
          />
        </Tab>
      ),
    };
 }

}

export default RunicPowerDetails;
