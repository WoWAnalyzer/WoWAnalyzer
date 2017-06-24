import React from 'react';

import SpecQuickStartTab from 'Main/SpecQuickStartTab';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

class CombatLogParser extends MainCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
  };

  generateResults() {
    const results = super.generateResults();

    results.tabs = [
      {
        title: 'Quick Start',
        url: 'quick-start',
        render: () => (
          <SpecQuickStartTab parser={this} />
        ),
      },
    ];

    return results;
  }
}

export default CombatLogParser;
