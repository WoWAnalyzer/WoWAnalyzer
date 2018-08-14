import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Interface/Others/Tab';
import ResourceBreakdown from 'Parser/Core/Modules/ResourceTracker/ResourceBreakdown';

import EnergyTracker from './EnergyTracker';

class EnergyDetails extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
  };

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
}

export default EnergyDetails;
