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
        minor: 0.95,
        average: 0.90,
        major: .85,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholds() {
    return {
      actual: this.wastedPercent,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: .15,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(`You wasted ${formatPercentage(this.wastedPercent)}% of your Runic Power.`)
          .icon('inv_sword_62')
          .actual(`${formatPercentage(actual)}% wasted`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
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
  statisticOrder = STATISTIC_ORDER.CORE(3);

  tab() {
    return {
      title: 'Runic Power usage',
      url: 'runic-power-usage',
      render: () => (
        <Tab>
          <ResourceBreakdown
            tracker={this.runicPowerTracker}
            showSpenders
          />
        </Tab>
      ),
    };
 }

}

export default RunicPowerDetails;
