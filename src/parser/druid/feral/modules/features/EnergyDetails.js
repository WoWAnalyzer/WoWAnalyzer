import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Panel from 'interface/others/Panel';
import ResourceBreakdown from 'parser/shared/modules/resourcetracker/ResourceBreakdown';

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
