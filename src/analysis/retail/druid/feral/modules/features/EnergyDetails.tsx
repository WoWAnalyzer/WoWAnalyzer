import { Panel } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';

import EnergyTracker from './EnergyTracker';

class EnergyDetails extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
  };

  energyTracker!: EnergyTracker;

  tab() {
    return {
      title: 'Energy usage',
      url: 'energy-usage',
      render: () => (
        <Panel>
          <ResourceBreakdown tracker={this.energyTracker} showSpenders />
        </Panel>
      ),
    };
  }
}

export default EnergyDetails;
