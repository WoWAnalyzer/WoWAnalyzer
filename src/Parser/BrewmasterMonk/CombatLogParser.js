// TODO:

import React from 'react';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

// Core
import HealingDone from './Modules/Core/HealingDone';
import DamageTaken from './Modules/Core/DamageTaken';
import DamageDone from './Modules/Core/DamageDone';
import HealingReceived from './Modules/Core/HealingReceived';
import Stagger from './Modules/Core/Stagger';

// Spells
import IronSkinBrew from './Modules/Spells/IronSkinBrew';
import BlackoutCombo from './Modules/Spells/BlackoutCombo';


// Features
import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';

// Items
import T20_2pc from './Modules/Items/T20_2pc';
import T20_4pc from './Modules/Items/T20_4pc';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    healingDone: HealingDone,
    healingReceived: HealingReceived,
    damageTaken: DamageTaken,
    stagger: Stagger,
    damageDone: DamageDone,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    castEfficiency: CastEfficiency,

    // Spells
    ironSkinBrew: IronSkinBrew,
    blackoutCombo: BlackoutCombo,

    // Items
    t20_2pc: T20_2pc,
    t20_4pc: T20_4pc,
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
