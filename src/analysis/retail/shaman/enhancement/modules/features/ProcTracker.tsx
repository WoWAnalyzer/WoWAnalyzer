import { Panel } from 'interface';
import CoreCooldownThroughputTracker from 'parser/shared/modules/CooldownThroughputTracker';
import CooldownOverview from 'parser/ui/CooldownOverview';

class ProcTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [];

  tab(): any {
    return {
      title: 'Procs',
      url: 'procs',
      render: () => (
        <Panel>
          <CooldownOverview
            fightStart={this.owner.fight.start_time}
            fightEnd={this.owner.fight.end_time}
            cooldowns={this.pastCooldowns}
            applyTimeFilter={this.owner.applyTimeFilter}
          />
        </Panel>
      ),
    };
  }
}

export default ProcTracker;
