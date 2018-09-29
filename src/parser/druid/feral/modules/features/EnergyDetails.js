import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Tab from 'interface/others/Tab';
import ResourceBreakdown from 'parser/core/modules/ResourceTracker/ResourceBreakdown';

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
