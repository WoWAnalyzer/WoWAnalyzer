import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Panel from 'interface/others/Panel';
import Statistic from 'interface/statistics/Statistic';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatPercentage } from 'common/format';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringResourceValue from 'interface/statistics/components/BoringResourceValue';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import RageTracker from './RageTracker';

class RageDetails extends Analyzer {
  static dependencies = {
    rageTracker: RageTracker,
  };

  protected rageTracker!: RageTracker;

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
      style: ThresholdStyle.PERCENTAGE,
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
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(`You wasted ${formatPercentage(this.wastedPercent)}% of your Rage.`)
          .icon('spell_nature_reincarnation')
          .actual(i18n._(t('warrior.fury.suggestions.rage.wasted')`${formatPercentage(actual)}% wasted`))
          .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        tooltip={`${this.rageTracker.wasted} out of ${this.rageTracker.wasted + this.rageTracker.generated} Rage wasted.`}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.RAGE}
          value={`${formatPercentage(this.wastedPercent)} %`}
          label="Rage wasted"
        />
      </Statistic>
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
