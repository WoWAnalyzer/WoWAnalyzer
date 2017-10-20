import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';
import ColossusSmashUptime from './Modules/BuffDebuff/ColossusSmashUptime';

//import RelicTraits from './Modules/Traits/RelicTraits';

class CombatLogParser extends CoreCombatLogParser {

  static specModules = {
    // WarriorCore
    damageDone: [DamageDone, {showStatistic: true}],

    // Features
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
    colossusSmashUptime: ColossusSmashUptime,

    // Talents

    // Traits

    // Items:

  };

  generateResults() {
    const results = super.generateResults();

    // TODO: Suggestion for Devo when it didn't prevent enough damage to be worthwhile
    // TODO: Suggestion for enchants

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
