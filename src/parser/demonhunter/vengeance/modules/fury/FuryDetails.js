import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import { Panel } from 'interface';
import { formatPercentage } from 'common/format';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import { t } from '@lingui/macro';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import BoringResourceValue from 'parser/ui/BoringResourceValue';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import FuryTracker from './FuryTracker';

class FuryDetails extends Analyzer {
  get wastedPercent() {
    return this.furyTracker.wasted / (this.furyTracker.wasted + this.furyTracker.generated) || 0;
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
    furyTracker: FuryTracker,
  };

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(`You wasted ${formatPercentage(this.wastedPercent)}% of your Fury.`)
        .icon('ability_demonhunter_demonspikes')
        .actual(t({
      id: "demonhunter.vengeance.suggestions.fury.wasted",
      message: `${formatPercentage(actual)}% wasted`
    }))
        .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="small"
        tooltip={`${this.furyTracker.wasted} out of ${this.furyTracker.wasted + this.furyTracker.generated} fury wasted.`}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.FURY}
          value={`${formatPercentage(this.wastedPercent)} %`}
          label='Fury wasted'
        />
      </Statistic>
    );
  }

  tab() {
    return {
      title: 'Fury usage',
      url: 'fury-usage',
      render: () => (
        <Panel>
          <ResourceBreakdown
            tracker={this.furyTracker}
            showSpenders
          />
        </Panel>
      ),
    };
  }

}

export default FuryDetails;
