import React from 'react';

import Panel from 'interface/others/Panel';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer from 'parser/core/Analyzer';
import ResourceBreakdown from 'parser/shared/modules/resourcetracker/ResourceBreakdown';
import { formatPercentage } from 'common/format';
import Icon from 'common/Icon';

import AstralPowerTracker from './AstralPowerTracker';

const MINOR_THRESHOLD = 0;
const AVERAGE_THRESHOLD = 0.02;
const MAJOR_THRESHOLD = 0.05;

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
        minor: MINOR_THRESHOLD,
        average: AVERAGE_THRESHOLD,
        major: MAJOR_THRESHOLD,
      },
      style: 'percentage',
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
        position={STATISTIC_ORDER.CORE(1)}
        icon={<Icon icon="ability_druid_cresentburn" />}
        value={`${formatPercentage(this.wastedPercent)} %`}
        label="Overcapped Astral Power"
        tooltip={`${this.wasted} out of ${this.total} Astral Power wasted.`}
      />
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
