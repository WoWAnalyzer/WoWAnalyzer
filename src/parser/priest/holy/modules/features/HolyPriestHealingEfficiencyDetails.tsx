import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Panel from 'interface/others/Panel';

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
      render: () => (
          <Panel>
            <HealingEfficiencyBreakdown
              // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
              // @ts-ignore
              tracker={this.healingEfficiencyTracker}
              showSpenders
            />
          </Panel>
        ),
    };
  }
}

export default HolyPriestHealingEfficiencyDetails;
