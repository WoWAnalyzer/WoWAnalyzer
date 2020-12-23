import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Panel from 'interface/others/Panel';
import { formatPercentage } from 'common/format';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import { t } from '@lingui/macro';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import BoringResourceValue from 'interface/statistics/components/BoringResourceValue';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import PainTracker from './PainTracker';

class PainDetails extends Analyzer {
  get wastedPercent() {
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

  static dependencies = {
    painTracker: PainTracker,
  };

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(`You wasted ${formatPercentage(this.wastedPercent)}% of your Pain.`)
        .icon('ability_demonhunter_demonspikes')
        .actual(t({
      id: "demonhunter.vengeance.suggestions.pain.wasted",
      message: `${formatPercentage(actual)}% wasted`
    }))
        .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="small"
        tooltip={`${this.painTracker.wasted} out of ${this.painTracker.wasted + this.painTracker.generated} pain wasted.`}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.PAIN}
          value={`${formatPercentage(this.wastedPercent)} %`}
          label='Pain wasted'
        />
      </Statistic>
    );
  }

  tab() {
    return {
      title: 'Pain usage',
      url: 'pain-usage',
      render: () => (
        <Panel>
          <ResourceBreakdown
            tracker={this.painTracker}
            showSpenders
          />
        </Panel>
      ),
    };
  }

}

export default PainDetails;
