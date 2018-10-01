import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Tab from 'interface/others/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatPercentage } from 'common/format';
import Icon from 'common/Icon';
import ResourceBreakdown from 'parser/core/modules/resourcetracker/ResourceBreakdown';

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
        average: 0.10,
        major: 0.15,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(`You wasted ${formatPercentage(this.wastedPercent)}% of your Pain.`)
          .icon('ability_demonhunter_demonspikes')
          .actual(`${formatPercentage(actual)}% wasted`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(1)}
        icon={<Icon icon="ability_demonhunter_demonspikes" />}
        value={`${formatPercentage(this.wastedPercent)} %`}
        label="Pain wasted"
        tooltip={`${this.painTracker.wasted} out of ${this.painTracker.wasted + this.painTracker.generated} pain wasted.`}
      />

    );
  }

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
