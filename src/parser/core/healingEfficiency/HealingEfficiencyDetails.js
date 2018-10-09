import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Tab from 'interface/others/Tab';
import HealingEfficiencyTracker from 'parser/core/healingEfficiency/HealingEfficiencyTracker';
import HealingEfficiencyBreakdown from './HealingEfficiencyBreakdown';

class HealingEfficiencyDetails extends Analyzer {
  static dependencies = {
    healingEfficiencyTracker: HealingEfficiencyTracker,
  };

  tab() {
    return {
      title: 'Mana Usage',
      url: 'mana-usage',
      render: () => (
        <Tab>
          <HealingEfficiencyBreakdown
            tracker={this.healingEfficiencyTracker}
            showSpenders
          />
        </Tab>
      ),
    };
  }
}

export default HealingEfficiencyDetails;
