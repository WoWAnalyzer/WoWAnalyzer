import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import DamageDone from './Modules/Core/DamageDone';
import DamageTaken from './Modules/Core/DamageTaken';
import HealingDone from './Modules/Core/HealingDone';

import Shield_Block from './Modules/Spells/ShieldBlock';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    damageTaken: DamageTaken,
    healingDone: [HealingDone, { showStatistic: true }],
    damageDone: DamageDone,
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
