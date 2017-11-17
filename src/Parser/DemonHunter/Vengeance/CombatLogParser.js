import React from 'react';

import Tab from 'Main/Tab';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import DamageTaken from 'Parser/Core/Modules/DamageTaken';

import PainChart from './Modules/PainChart/Pain';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';

import SoulFragments from './Modules/Statistics/SoulFragments/SoulFragments';
import SpiritBomb from './Modules/Statistics/SpiritBomb/SpiritBomb';

import ImmolationAura from './Modules/Statistics/Spells/ImmolationAura';
import DemonSpikes from './Modules/Statistics/Spells/DemonSpikes';
import EmpowerWards from './Modules/Statistics/Spells/EmpowerWards';
import SigilOfFlame from './Modules/Statistics/Spells/SigilOfFlame';

import Tier202PBonus from './Modules/Tier/Tier20/Tier20-2P.js';
import Tier204PBonus from './Modules/Tier/Tier20/Tier20-4P.js';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    damageDone: [DamageDone, { showStatistic: true }],
    damageTaken: [DamageTaken, { showStatistic: true }],
    healingDone: [HealingDone, { showStatistic: true }],

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,

    // Spirit Bomb Tracker Module (Frailty uptime tracker)
    spiritBomb: SpiritBomb,

    // Soul Fragments Tracker module (includes Generated and Wasted)
    soulFragments: SoulFragments,

    // Spell Statistics
    immolationAura: ImmolationAura,
    demonSpikes: DemonSpikes,
    empowerWards: EmpowerWards,
    sigilOfFlame: SigilOfFlame,

    // Tier 20
    tier202PBonus: Tier202PBonus,
    tier204PBonus: Tier204PBonus,
  };

  generateResults() {
    const results = super.generateResults();

    results.tabs = [
      ...results.tabs,
      { // TODO: Move this to an Analyzer module
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
    ];

    return results;
  }
}

export default CombatLogParser;
