import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';

import Tier20_4set from './Modules/Items/Tier20_4set';
import ShardOfTheExodar from './Modules/Items/ShardOfTheExodar';


class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
    damageDone: [DamageDone, { showStatistic: true }],

	  //Items
	  tier20_4set: Tier20_4set,
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
