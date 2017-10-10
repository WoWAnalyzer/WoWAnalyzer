import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';
import WintersChillTracker from './Modules/Features/WintersChill';
import BrainFreeze from './Modules/Features/BrainFreeze';
import FingersFrost from './Modules/Features/FingersFrost';
import IcyVeinsDuration from './Modules/Features/IcyVeinsDuration';
import IcicleTracker from './Modules/Features/IcicleTracker';

import Tier20_2set from './Modules/Items/Tier20_2set';
import ShardOfTheExodar from './Modules/Items/ShardOfTheExodar';


class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
	  wintersChillTracker: WintersChillTracker,
	  brainFreeze: BrainFreeze,
	  fingersFrost: FingersFrost,
	  icyVeinsDuration: IcyVeinsDuration,
	  icicleTracker: IcicleTracker,
    damageDone: [DamageDone, { showStatistic: true }],

	  //Cooldowns

	  //Items
	  tier20_2set: Tier20_2set,
	  shardOfTheExodar: ShardOfTheExodar,

  };

  generateResults() {
    const results = super.generateResults();
    results.tabs = [
      {
        title: 'Suggestions',
        url: 'suggestions',
        render: () => (
          <SuggestionsTab issues={results.issues} />
        ),
      },
      {
        title: 'Talents',
        url: 'talents',
        render: () => (
          <Tab title="Talents">
            <Talents combatant={this.modules.combatants.selected} />
          </Tab>
        ),
      },
      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
