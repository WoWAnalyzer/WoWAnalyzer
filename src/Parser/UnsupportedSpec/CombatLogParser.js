import React from 'react';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import DamageTaken from 'Parser/Core/Modules/DamageTaken';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import NotImplementedYet from './Modules/NotImplementedYet';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    healingDone: [HealingDone, { showStatistic: true }],
    damageTaken: [DamageTaken, { showStatistic: true }],
    damageDone: [DamageDone, { showStatistic: true }],

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
