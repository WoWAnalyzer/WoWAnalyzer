import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { Panel } from 'interface';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { formatPercentage } from 'common/format';
import { Icon } from 'interface';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import { t } from '@lingui/macro';

import RageTracker from './RageTracker';

class RageDetails extends Analyzer {
  get wastedPercent() {
    return (this.rageTracker.wasted / (this.rageTracker.wasted + this.rageTracker.generated) || 0);
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

  static dependencies = {
    rageTracker: RageTracker,
  };

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(`You wasted ${formatPercentage(this.wastedPercent)}% of your Rage.`)
      .icon('spell_nature_reincarnation')
      .actual(t({
      id: "warrior.arms.suggestions.rage.wasted",
      message: `${formatPercentage(actual)}% wasted`
    }))
      .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(5)}
        icon={<Icon icon="spell_nature_reincarnation" />}
        value={`${formatPercentage(this.wastedPercent)} %`}
        label="Rage wasted"
        tooltip={`${this.rageTracker.wasted} out of ${this.rageTracker.wasted + this.rageTracker.generated} rage wasted.`}
      />
    );
  }

  tab() {
    return {
      title: 'Rage usage',
      url: 'rage-usage',
      render: () => (
        <Panel>
          <ResourceBreakdown
            tracker={this.rageTracker}
            showSpenders
          />
        </Panel>
      ),
    };
  }

}

export default RageDetails;
