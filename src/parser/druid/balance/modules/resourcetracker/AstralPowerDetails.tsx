import React from 'react';

import Panel from 'interface/others/Panel';
import Statistic from 'interface/statistics/Statistic';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringResourceValue from 'interface/statistics/components/BoringResourceValue';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

import Analyzer from 'parser/core/Analyzer';
import { formatPercentage } from 'common/format';
import { t } from '@lingui/macro';

import AstralPowerTracker from './AstralPowerTracker';

const MINOR_THRESHOLD = 0;
const AVERAGE_THRESHOLD = 0.02;
const MAJOR_THRESHOLD = 0.05;

class AstralPowerDetails extends Analyzer {
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
        minor: MINOR_THRESHOLD,
        average: AVERAGE_THRESHOLD,
        major: MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.wastedPercent,
      isLessThan: {
        minor: 1 - MINOR_THRESHOLD,
        average: 1 - AVERAGE_THRESHOLD,
        major: 1 - MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    astralPowerTracker: AstralPowerTracker,
  };
  protected astralPowerTracker!: AstralPowerTracker;

  suggestions(when: When) {
    when(this.suggestionThresholdsWasted)
      .addSuggestion((suggest, actual, recommended) => suggest(`You overcapped ${this.wasted} Astral Power. Always prioritize spending it over avoiding the overcap of any other ability.`)
        .icon('ability_druid_cresentburn')
        .actual(t({
      id: "druid.balance.suggestions.astralPower.overcapped",
      message: `${formatPercentage(actual)}% overcapped Astral Power`
    }))
        .recommended(`${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="small"
        tooltip={`${this.wasted} out of ${this.total} Astral Power wasted.`}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.ASTRAL_POWER}
          value={`${formatPercentage(this.wastedPercent)} %`}
          label="Overcapped Astral Power"
        />
      </Statistic>
    );
  }

  tab() {
    return {
      title: 'Astral Power usage',
      url: 'astral-power-usage',
      render: () => (
        <Panel>
          <ResourceBreakdown
            tracker={this.astralPowerTracker}
            showSpenders
          />
        </Panel>
      ),
    };
  }

}

export default AstralPowerDetails;
