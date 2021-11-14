import { Panel } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import React from 'react';

import { Build } from '../../CONFIG';
import HealingEfficiencyBreakdown from './HealingEfficiencyBreakdown';
import HealingEfficiencyTracker from './HealingEfficiencyTracker';

class HealingEfficiencyDetails extends Analyzer {
  static dependencies = {
    healingEfficiencyTracker: HealingEfficiencyTracker,
  };

  protected healingEfficiencyTracker!: HealingEfficiencyTracker;

  constructor(options: Options) {
    super(options);

    this.active = this.owner.build === Build.DEFAULT;
  }

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

export default HealingEfficiencyDetails;
