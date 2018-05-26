import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import Icon from 'common/Icon';
import ResourceBreakdown from 'Parser/Core/Modules/ResourceTracker/ResourceBreakdown';

import PainTracker from './PainTracker';

class PainDetails extends Analyzer {
  static dependencies = {
    painTracker: PainTracker,
  };

  get wastedPercent(){
    return this.painTracker.wasted / (this.painTracker.wasted + this.painTracker.generated) || 0;
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
        return suggest(`You wasted ${formatPercentage(this.wastedPercent)}% of your Pain.`)
          .icon('ability_demonhunter_demonspikes')
          .actual(`${formatPercentage(actual)}% wasted`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="ability_demonhunter_demonspikes" />}
        value={`${formatPercentage(this.wastedPercent)} %`}
        label="Pain wasted"
        tooltip={`${this.painTracker.wasted} out of ${this.painTracker.wasted + this.painTracker.generated} pain wasted.`}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);

  tab() {
    return {
      title: 'Pain usage',
      url: 'pain-usage',
      render: () => (
        <Tab>
          <ResourceBreakdown
            tracker={this.painTracker}
            showSpenders
          />
        </Tab>
      ),
    };
 }

}

export default PainDetails;
