import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

// Features
import DamageDone from 'Parser/Core/Modules/DamageDone';
import Cinidaria from 'Parser/Core/Modules/Items/Cinidaria';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CastEfficiency from './Modules/Features/CastEfficiency';
import CooldownTracker from './Modules/Features/CooldownTracker';
import ComboStrikes from './Modules/Features/ComboStrikes';

// Spells
import ComboBreaker from './Modules/Spells/ComboBreaker';
import StormEarthAndFire from './Modules/Spells/StormEarthAndFire';

// Talents
import HitCombo from './Modules/Talents/HitCombo';

// Legendaries
import KatsuosEclipse from './Modules/Items/KatsuosEclipse';
import CenedrilReflectorOfHatred from './Modules/Items/CenedrilReflectorOfHatred';
import SoulOfTheGrandmaster from './Modules/Items/SoulOfTheGrandmaster';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    damageDone: [DamageDone, { showStatistic: true }],
    alwaysBeCasting: AlwaysBeCasting,
    castEfficiency: CastEfficiency,
    cooldownTracker: CooldownTracker,
    comboStrikes: ComboStrikes,

    // Talents:
    hitCombo: HitCombo,

    // Spells;
    comboBreaker: ComboBreaker,
    stormEarthAndFire: StormEarthAndFire,

    // Legendaries / Items:
    katsuosEclipse: KatsuosEclipse,
    cinidaria: Cinidaria,
    cenedrilReflectorOfHatred: CenedrilReflectorOfHatred,
    soulOfTheGrandmaster: SoulOfTheGrandmaster,

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
