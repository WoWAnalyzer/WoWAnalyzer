import React from 'react';

import SPELLS from 'common/SPELLS';

import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'Parser/Core/Modules/CooldownThroughputTracker';

import Tab from 'Main/Tab';
import CooldownOverview from 'Main/CooldownOverview';

class ProcTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    {
      spell: SPELLS.POWER_OF_THE_MAELSTROM,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.ELEMENTAL_FOCUS,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.LAVA_SURGE,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];

  tab() {
    return {
      title: 'Procs',
      url: 'procs',
      render: () => (
        <Tab>
          <CooldownOverview
            fightStart={this.owner.fight.start_time}
            fightEnd={this.owner.fight.end_time}
            cooldowns={this.pastCooldowns}
          />
        </Tab>
      ),
    };
  }
}

export default ProcTracker;
