import React from 'react';

import Panel from 'interface/statistics/Panel';
import Analyzer from 'parser/core/Analyzer';

import HealingEfficiencyTracker from './HealingEfficiencyTracker';
import HealingEfficiencyBreakdown from './HealingEfficiencyBreakdown';

class HealingEfficiencyDetails extends Analyzer {
  static dependencies = {
    healingEfficiencyTracker: HealingEfficiencyTracker,
  };

  statistic() {
    return (
      <Panel
        title="Mana Efficiency"
        position={120}
      >
        <HealingEfficiencyBreakdown
          tracker={this.healingEfficiencyTracker}
          showSpenders
        />
      </Panel>
    );
  }
}

export default HealingEfficiencyDetails;
