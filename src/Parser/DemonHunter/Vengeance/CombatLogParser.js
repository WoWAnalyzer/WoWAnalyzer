import React from 'react';

import Tab from 'Interface/Others/Tab';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import DamageTaken from 'Parser/Core/Modules/DamageTaken';

import PainChart from './Modules/PainChart/Pain';
import PainTracker from './Modules/Pain/PainTracker';
import PainDetails from './Modules/Pain/PainDetails';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Abilities from './Modules/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import MitigationCheck from './Modules/Features/MitigationCheck';

import Checklist from './Modules/Features/Checklist/Module';

import SoulFragmentsConsume from './Modules/Statistics/SoulFragmentsConsume';
import SoulFragmentsTracker from './Modules/Features/SoulFragmentsTracker';
import SoulsOvercap from './Modules/Statistics/SoulsOvercap';

import SpiritBombFrailtyDebuff from './Modules/Talents/SpiritBombFrailtyDebuff';
import SoulBarrier from './Modules/Talents/SoulBarrier';
import SpiritBombSoulsConsume from './Modules/Talents/SpiritBombSoulsConsume';
import VoidReaverDebuff from './Modules/Talents/VoidReaverDebuff';
import FeedTheDemon from './Modules/Talents/FeedTheDemon';
import Gluttony from './Modules/Talents/Gluttony';
import BurningAlive from './Modules/Talents/BurningAlive';
import FeastOfSouls from './Modules/Talents/FeastOfSouls';
import AgonizingFlames from './Modules/Talents/AgonizingFlames';

import ImmolationAura from './Modules/Spells/ImmolationAura';
import DemonSpikes from './Modules/Spells/DemonSpikes';
import SigilOfFlame from './Modules/Spells/SigilOfFlame';
import SoulCleaveSoulsConsumed from './Modules/Spells/SoulCleaveSoulsConsumed';

import Tier202PBonus from './Modules/Tier/Tier20/Tier20-2P.js';
import Tier204PBonus from './Modules/Tier/Tier20/Tier20-4P.js';
import SoulOfTheSlayer from '../Shared/Modules/Items/SoulOfTheSlayer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    damageDone: [DamageDone, { showStatistic: true }],
    damageTaken: [DamageTaken, { showStatistic: true }],
    healingDone: [HealingDone, { showStatistic: true }],
    mitigationCheck: MitigationCheck,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    soulFragmentsTracker: SoulFragmentsTracker,
    checklist: Checklist,

    //Resource Tracker
    painTracker: PainTracker,
    painDetails: PainDetails,

    //Talents
    SpiritBombFrailtyDebuff: SpiritBombFrailtyDebuff,
    soulBarrier: SoulBarrier,
    spiritBombSoulsConsume: SpiritBombSoulsConsume,
    feedTheDemon: FeedTheDemon,
    gluttony: Gluttony,
    burningAlive: BurningAlive,
    feastOfSouls: FeastOfSouls,
    agonizingFlames: AgonizingFlames,

    // Spell
    immolationAura: ImmolationAura,
    demonSpikes: DemonSpikes,
    sigilOfFlame: SigilOfFlame,
    soulCleaveSoulsConsumed: SoulCleaveSoulsConsumed,
    voidReaverDebuff: VoidReaverDebuff,

    //Stats
    soulsOvercap: SoulsOvercap,
    soulFragmentsConsume: SoulFragmentsConsume,

    // Tier 20
    tier202PBonus: Tier202PBonus,
    tier204PBonus: Tier204PBonus,
    soulOfTheSlayer: SoulOfTheSlayer,
  };

  generateResults(...args) {
    const results = super.generateResults(...args);

    results.tabs = [
      ...results.tabs,
      { // TODO: Move this to an Analyzer module
        title: 'Pain Chart',
        url: 'pain',
        render: () => (
          <Tab style={{ padding: '15px 22px' }}>
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
