import React from 'react';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';

import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

class CombatLogParser extends MainCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
  };

  generateResults() {
    const results = super.generateResults();

    results.tabs = [
      {
        title: 'Talents',
        url: 'talents',
        render: () => (
          <Tab title="Talents">
            <Talents combatant={this.selectedCombatant} />
          </Tab>
        ),
      },
      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
