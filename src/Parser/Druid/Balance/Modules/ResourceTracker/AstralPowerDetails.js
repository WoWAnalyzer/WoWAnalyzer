import React from 'react';

import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';
import ResourceBreakdown from 'Parser/Core/Modules/ResourceTracker/ResourceBreakdown';
import { formatPercentage } from 'common/format';
import Icon from 'common/Icon';

import AstralPowerTracker from './AstralPowerTracker';

class AstralPowerDetails extends Analyzer {
  static dependencies = {
    astralPowerTracker: AstralPowerTracker,
  };

  get wasted() {
    return this.astralPowerTracker.wasted || 0;
  }

  get total() {
    return this.astralPowerTracker.wasted + this.astralPowerTracker.generated || 0;
  }

  get wastedPerMinute() {
    return (this.wasted / this.owner.fightDuration) * 1000 * 60 || 0;
  }

  get wastedPercent() {
    return this.wasted / this.total || 0;
  }

  get suggestionThresholdsWasted() {
    return {
      actual: this.wastedPercent,
      isGreaterThan: {
        minor: 0,
        average: 0.02,
        major: 0.05,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.wastedPercent,
      isLessThan: {
        minor: 1.00,
        average: 0.98,
        major: 0.95,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholdsWasted)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(`You overcapped ${this.wasted} Astral Power. Always prioritize spending it over avoiding the overcap of any other ability.`)
          .icon('ability_druid_cresentburn')
          .actual(`${formatPercentage(actual)}% overcapped Astral Power`)
          .recommended(`${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="ability_druid_cresentburn" />}
        value={`${this.wastedPerMinute.toFixed(2)}`}
        label="Overcapped Astral Power per minute"
        tooltip={`${this.wasted} out of ${this.total} (${formatPercentage(this.wastedPercent)}%) Astral Power wasted.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(1);

  tab() {
    return {
      title: 'Astral Power usage',
      url: 'astral-power-usage',
      render: () => (
        <Tab>
          <ResourceBreakdown
            tracker={this.astralPowerTracker}
            showSpenders={true}
          />
        </Tab>
      ),
    };
 }

}

export default AstralPowerDetails;
