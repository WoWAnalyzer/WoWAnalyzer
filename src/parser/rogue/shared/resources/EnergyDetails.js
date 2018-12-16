import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Panel from 'interface/others/Panel';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';
import ResourceBreakdown from 'parser/shared/modules/resourcetracker/ResourceBreakdown';

import EnergyTracker from './EnergyTracker';

const MINOR_THRESHOLD = 0.05;
const AVERAGE_THRESHOLD = 0.1;
const MAJOR_THRESHOLD = 0.2;

class EnergyDetails extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
  };

  get wasted() {
    return this.energyTracker.wasted || 0;
  }

  get total() {
    return this.energyTracker.wasted + this.energyTracker.generated || 0;
  }

  get wastedPercent() {
    return this.wasted / this.total || 0;
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

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(2)}
        icon={<Icon icon="ability_warrior_decisivestrike" alt="Wasted Energy" />}
        value={`${formatPercentage(this.wastedPercent)} %`}
        label="Wasted generator Energy"
        tooltip={`You wasted ${this.wasted} out of ${this.total} Energy from generators. Some waste is expected due to the random nature of some generation abilities.`}
      />
    );
  }

  tab() {
    return {
      title: 'Energy usage',
      url: 'energy-usage',
      render: () => (
        <Panel>
          <ResourceBreakdown
            tracker={this.energyTracker}
            showSpenders
          />
        </Panel>
      ),
    };
 }

}

export default EnergyDetails;
