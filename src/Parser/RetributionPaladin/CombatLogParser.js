import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';
import DamageDone from './Modules/PaladinCore/DamageDone';

import WhisperOfTheNathrezim from './Modules/Items/WhisperOfTheNathrezim';

class CombatLogParser extends CoreCombatLogParser {

  static specModules = {
    // Override the ability tracker so we also get stats for IoL and beacon healing

    // PaladinCore
    damageDone: DamageDone,

    // Features
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,

    // Talents

    // Traits

    // Items:
    whisperOfTheNathrezim: WhisperOfTheNathrezim,
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
