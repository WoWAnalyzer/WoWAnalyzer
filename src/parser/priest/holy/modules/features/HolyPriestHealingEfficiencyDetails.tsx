import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Panel from 'interface/others/Panel';

import HealingEfficiencyTracker from './HolyPriestHealingEfficiencyTracker';
import HealingEfficiencyBreakdown from './HolyPriestHealingEfficiencyBreakdown';

class HolyPriestHealingEfficiencyDetails extends Analyzer {
  static dependencies = {
    healingEfficiencyTracker: HealingEfficiencyTracker,
  };

  protected healingEfficiencyTracker!: HealingEfficiencyTracker;

  tab() {
    return {
      title: 'Mana Efficiency',
      url: 'mana-efficiency',
      render: () => (
        <Panel>
          <HealingEfficiencyBreakdown tracker={this.healingEfficiencyTracker} />
        </Panel>
      ),
    };
  }
}

export default HolyPriestHealingEfficiencyDetails;
