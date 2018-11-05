import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Tab from 'interface/others/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Icon from 'common/Icon';
import ResourceBreakdown from 'parser/shared/modules/resourcetracker/ResourceBreakdown';

import EnergyTracker from './EnergyTracker';

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
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  statistic() {
    const energyWasted = this.energyTracker.wasted;
    const pointsWastedPerMinute = (energyWasted / this.owner.fightDuration) * 1000 * 60;
    return (
      <StatisticBox
        icon={<Icon icon="ability_warrior_decisivestrike" alt="Waisted Energy" />}
        value={`${pointsWastedPerMinute.toFixed(2)}`}
        label="Wasted Energy per minute"
        tooltip={`You wasted a total of ${energyWasted} energy. Some waste is expected due to the random nature of some generation abilities.`}
      />
    );
  }

  tab() {
    return {
      title: 'Energy usage',
      url: 'energy-usage',
      render: () => (
        <Tab>
          <ResourceBreakdown
            tracker={this.energyTracker}
            showSpenders
          />
        </Tab>
      ),
    };
 }

  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default EnergyDetails;
