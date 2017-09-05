import React from 'react';

import ITEMS from 'common/ITEMS';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import CastEfficiency from './Modules/Features/CastEfficiency';


import CooldownTracker from './Modules/Features/CooldownTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import DamageDone from './Modules/MMCore/DamageDone';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // MM Core
    damageDone: DamageDone,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    castEfficiency: CastEfficiency,
    cooldownTracker: CooldownTracker,
  };

  generateResults() {
    const results = super.generateResults();

    this.selectedCombatant._combatantInfo.gear.forEach(function (value) {
      const equippedItem = ITEMS[value.id];

      if (equippedItem !== undefined && equippedItem.quality === 5) {
        results.items.push({
          item: equippedItem,
          result: (
            <dfn data-tip="">
              Equipped Legendary
            </dfn>
          ),
        });
      }
    });

    results.items = [
      ...results.items,
    ];

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
