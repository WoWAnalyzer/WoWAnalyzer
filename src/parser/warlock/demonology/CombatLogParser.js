import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Felstorm from './modules/features/Felstorm';
import Checklist from './modules/features/Checklist/Module';

import DoomUptime from './modules/features/DoomUptime';

import SoulShardTracker from './modules/soulshards/SoulShardTracker';
import SoulShardDetails from './modules/soulshards/SoulShardDetails';

import DemoPets from './modules/pets/DemoPets';
import PetTimelineTab from './modules/pets/PetTimelineTab';
import PrepullPetNormalizer from './modules/pets/normalizers/PrepullPetNormalizer';

import PowerSiphonNormalizer from './modules/talents/normalizers/PowerSiphonNormalizer';

import DemonicCalling from './modules/talents/DemonicCalling';
import GrimoireFelguard from './modules/talents/GrimoireFelguard';

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
    petTimelineTab: PetTimelineTab,
    prepullPetNormalizer: PrepullPetNormalizer,

    // Normalizers
    powerSiphonNormalizer: PowerSiphonNormalizer,

    // Talents
    demonicCalling: DemonicCalling,
    grimoireFelguard: GrimoireFelguard,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }],
  };
}

export default CombatLogParser;
