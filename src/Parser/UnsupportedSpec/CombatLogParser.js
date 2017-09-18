import React from 'react';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import NotImplementedYet from './Modules/NotImplementedYet';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    notImplementedYet: NotImplementedYet,
  };

  generateResults() {
    const results = super.generateResults();

    results.tabs = [
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
