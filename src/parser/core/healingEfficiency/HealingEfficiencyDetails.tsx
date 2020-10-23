import React from 'react';

import Panel from 'interface/statistics/Panel';
import Analyzer from 'parser/core/Analyzer';
import { Trans } from '@lingui/macro';

import HealingEfficiencyTracker from './HealingEfficiencyTracker';
import HealingEfficiencyBreakdown from './HealingEfficiencyBreakdown';

class HealingEfficiencyDetails extends Analyzer {
  static dependencies = {
    healingEfficiencyTracker: HealingEfficiencyTracker,
  };

  protected healingEfficiencyTracker!: HealingEfficiencyTracker;

  statistic() {
    return (
      <Panel
        title={<Trans id="shared.healingEfficiency.title">Mana Efficiency</Trans>}
        position={120}
      >
        <HealingEfficiencyBreakdown tracker={this.healingEfficiencyTracker} />
      </Panel>
    );
  }
}

export default HealingEfficiencyDetails;
