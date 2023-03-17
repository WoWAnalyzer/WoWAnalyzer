import { TALENTS_SHAMAN } from 'common/TALENTS';
import { RETAIL_EXPANSION } from 'game/Expansion';
import { Panel } from 'interface';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';
import CooldownOverview from 'parser/ui/CooldownOverview';

class ProcTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    {
      spell: TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      expansion: RETAIL_EXPANSION,
    },
  ];

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
