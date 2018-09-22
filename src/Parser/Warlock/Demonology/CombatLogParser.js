import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import Felstorm from './Modules/Features/Felstorm';
import Checklist from './Modules/Features/Checklist/Module';

import DoomUptime from './Modules/Features/DoomUptime';

import SoulShardTracker from './Modules/SoulShards/SoulShardTracker';
import SoulShardDetails from './Modules/SoulShards/SoulShardDetails';
import DemoPets from './Modules/WarlockCore/Pets';

import DemonicCalling from './Modules/Talents/DemonicCalling';
import GrimoireFelguard from './Modules/Talents/GrimoireFelguard';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],
    felstorm: Felstorm,
    checklist: Checklist,

    // DoTs
    doomUptime: DoomUptime,

    // Core
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    demoPets: DemoPets,

    // Talents
    demonicCalling: DemonicCalling,
    grimoireFelguard: GrimoireFelguard,
  };
}

export default CombatLogParser;
