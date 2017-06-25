import React from 'react';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';

import TalentsTab from 'Main/TalentsTab';

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
          <TalentsTab combatant={this.selectedCombatant} />
        ),
      },
    ];

    return results;
  }
}

export default CombatLogParser;
