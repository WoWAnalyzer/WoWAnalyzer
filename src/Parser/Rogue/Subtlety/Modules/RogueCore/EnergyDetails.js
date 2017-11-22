import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Icon from 'common/Icon';

import EnergyTracker from './EnergyTracker';

import ResourceBreakdown from '../ResourceTracker/ResourceBreakdown';

class EnergyDetails extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
  };
  
  statistic() {
    const energyWasted = this.energyTracker.wasted;
    return (
      <StatisticBox      
        icon={<Icon icon="ability_warrior_decisivestrike" alt="Waisted Energy" />}
        value={`${energyWasted}`}
        label="Wasted Energy"
      />
    );
  }

  tab() {
    return {
      title: 'Energy usage',
      url: 'energy',
      render: () => (
        <Tab title="Energy usage breakdown">
          <ResourceBreakdown
            tracker={this.energyTracker}
            resourceName="Energy"
          />
        </Tab>
      ),
    };
 }

  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default EnergyDetails;
