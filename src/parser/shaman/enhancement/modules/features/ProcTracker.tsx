import React from 'react';

import SPELLS from 'common/SPELLS';
import Panel from 'interface/others/Panel';
import CooldownOverview from 'interface/others/CooldownOverview';
import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'parser/shared/modules/CooldownThroughputTracker';

class ProcTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    {
      spell: SPELLS.ASCENDANCE_TALENT_ENHANCEMENT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];

  tab() : any {
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
