import React from 'react';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import PainChart from './Modules/PainChart/Pain';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CastEfficiency from './Modules/Features/CastEfficiency';
import SpiritBomb from './Modules/Features/SpiritBomb';

import DamageDone from './Modules/Statistics/Core/DamageDone';
import DamageTaken from './Modules/Statistics/Core/DamageTaken';
import HealingDone from './Modules/Statistics/Core/HealingDone';

import SoulFragments from './Modules/Statistics/SoulFragments/SoulFragments';

import ImmolationAura from './Modules/Statistics/Spells/ImmolationAura';
import DemonSpikes from './Modules/Statistics/Spells/DemonSpikes';
import EmpowerWards from './Modules/Statistics/Spells/EmpowerWards';
import SigilOfFlame from './Modules/Statistics/Spells/SigilOfFlame';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    damageDone: DamageDone,
    damageTaken: DamageTaken,
    healingDone: HealingDone,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    castEfficiency: CastEfficiency,
    spiritBomb: SpiritBomb,

    // Soul Fragments
    soulFragments: SoulFragments,

    // Spell Statistics
    immolationAura: ImmolationAura,
    demonSpikes: DemonSpikes,
    empowerWards: EmpowerWards,
    sigilOfFlame: SigilOfFlame,
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
      {
        title: 'Pain Chart',
        url: 'pain',
        render: () => (
          <Tab title="Pain" style={{ padding: '15px 22px' }}>
            <PainChart
              reportCode={this.report.code}
              actorId={this.playerId}
              start={this.fight.start_time}
              end={this.fight.end_time}
            />
          </Tab>
        ),
      },
      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
