import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import DamageTaken from 'Parser/Core/Modules/DamageTaken';

import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';

import Shield_Block from './Modules/Spells/ShieldBlock';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    damageTaken: [DamageTaken, { showStatistic: true }],
    healingDone: [HealingDone, { showStatistic: true }],
    damageDone: [DamageDone, { showStatistic: true }],
    // Features
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    shield_block: Shield_Block,
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
