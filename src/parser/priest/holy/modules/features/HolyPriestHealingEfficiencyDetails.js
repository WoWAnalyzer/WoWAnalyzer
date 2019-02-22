import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Tab from 'interface/others/Tab';
import HealingEfficiencyTracker from './HolyPriestHealingEfficiencyTracker';
import HealingEfficiencyBreakdown from './HolyPriestHealingEfficiencyBreakdown';

class HolyPriestHealingEfficiencyDetails extends Analyzer {
  static dependencies = {
    healingEfficiencyTracker: HealingEfficiencyTracker,
  };

  tab() {
    return {
      title: 'Mana Efficiency',
      url: 'mana-efficiency',
      render: () => {
        return [(<Tab>
          <HealingEfficiencyBreakdown
            tracker={this.healingEfficiencyTracker}
            showSpenders
          />
        </Tab>), null];
      },
    };
  }
}

export default HolyPriestHealingEfficiencyDetails;
