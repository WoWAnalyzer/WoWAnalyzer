import { Panel } from 'interface';
import Analyzer from 'parser/core/Analyzer';

import HealingEfficiencyBreakdown from './HolyPriestHealingEfficiencyBreakdown';
import HealingEfficiencyTracker from './HolyPriestHealingEfficiencyTracker';

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
