import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

//Features
import CastEfficiency from './Modules/Features/CastEfficiency';
import CooldownTracker from './Modules/Features/CooldownTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import VulnerableUptime from './Modules/Features/VulnerableUptime';
import VulnerableTracker from './Modules/Features/AimedInVulnerableTracker';

//Tier
import Tier20_2p from './Modules/Items/Tier20_2p';
import Tier20_4p from './Modules/Items/Tier20_4p';

//Spells
import Trueshot from './Modules/Spells/Trueshot';


class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Marksmanship Core
    damageDone: [DamageDone, { showStatistic: true }],

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    castEfficiency: CastEfficiency,
    cooldownTracker: CooldownTracker,
    vulnerableTracker: VulnerableTracker,
    vulnerableUptime: VulnerableUptime,

    //Items
    tier20_2p: Tier20_2p,
    tier20_4p: Tier20_4p,

    //Spells
    trueshot: Trueshot,


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
