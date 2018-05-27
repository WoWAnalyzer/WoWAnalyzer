import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import Icon from 'common/Icon';
import ResourceBreakdown from 'Parser/Core/Modules/ResourceTracker/ResourceBreakdown';

import RageTracker from './RageTracker';

class RageDetails extends Analyzer {
  static dependencies = {
    rageTracker: RageTracker,
  };

  get wastedPercent(){
    return this.rageTracker.wasted / (this.rageTracker.wasted + this.rageTracker.generated) || 0;
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
        return suggest(`You wasted ${formatPercentage(this.wastedPercent)}% of your Rage.`)
          .icon('spell_nature_reincarnation')
          .actual(`${formatPercentage(actual)}% wasted`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="spell_nature_reincarnation" />}
        value={`${formatPercentage(this.wastedPercent)} %`}
        label="Rage wasted"
        tooltip={`${this.rageTracker.wasted} out of ${this.rageTracker.wasted + this.rageTracker.generated} Rage wasted.`}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);

  tab() {
    return {
      title: 'Rage usage',
      url: 'rage-usage',
      render: () => (
        <Tab>
          <ResourceBreakdown
            tracker={this.rageTracker}
            showSpenders
          />
        </Tab>
      ),
    };
 }

}

export default RageDetails;
