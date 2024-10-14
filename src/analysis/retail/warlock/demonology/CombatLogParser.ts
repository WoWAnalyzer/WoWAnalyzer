import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import DemonologyWarlockVaultOfTheIncarnates4Set from './modules/dragonflight/tier/VaultOfTheIncarnates4Set';
import DemonologyWarlockAberrus2Set from './modules/dragonflight/tier/Aberrus2Set';

import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/Checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Felstorm from './modules/features/Felstorm';
import LegionStrike from './modules/features/LegionStrike';
import SummonDemonicTyrant from './modules/features/SummonDemonicTyrant';
import DemoPets from './modules/pets/DemoPets';
import DemonicTyrantHandler from './modules/pets/DemoPets/DemonicTyrantHandler';
import ImplosionHandler from './modules/pets/DemoPets/ImplosionHandler';
import PetDamageHandler from './modules/pets/DemoPets/PetDamageHandler';
import PetSummonHandler from './modules/pets/DemoPets/PetSummonHandler';
import PowerSiphonHandler from './modules/pets/DemoPets/PowerSiphonHandler';
import WildImpEnergyHandler from './modules/pets/DemoPets/WildImpEnergyHandler';
import PrepullPetNormalizer from './modules/pets/normalizers/PrepullPetNormalizer';
import SummonOrderNormalizer from './modules/pets/normalizers/SummonOrderNormalizer';
import SoulShardDetails from './modules/resources/SoulShardDetails';
import SoulShardTracker from './modules/resources/SoulShardTracker';
import SoulShardGraph from './modules/resources/SoulShardGraph';
import BilescourgeBombers from './modules/talents/BilescourgeBombers';
import DemonicCalling from './modules/talents/DemonicCalling';
import DemonicStrength from './modules/talents/DemonicStrength';
import Doom from './modules/talents/Doom';
import DreadCalling from './modules/talents/DreadCalling';
import Dreadlash from './modules/talents/Dreadlash';
import GrimoireFelguard from './modules/talents/GrimoireFelguard';
import InnerDemons from './modules/talents/InnerDemons';
import PowerSiphonNormalizer from './modules/talents/normalizers/PowerSiphonNormalizer';
import PowerSiphonBuffCastNormalizer from './modules/talents/normalizers/PowerSiphonBuffCastNormalizer';
import PowerSiphon from './modules/talents/PowerSiphon';
import SacrificedSouls from './modules/talents/SacrificedSouls';
import SoulConduit from './modules/talents/SoulConduit';
import SoulStrike from './modules/talents/SoulStrike';
import SummonVilefiend from './modules/talents/SummonVilefiend';
import DiabolicRitual from './modules/talents/DiabolicRitual';
import DiabolicRitualEmpowers from './modules/talents/DiabolicRitualEmpowers';
import Guide from './Guide';
import T31AmirdrassilDemonology from './modules/dragonflight/tier/T31AmirdrassilDemonology';
import { UnendingResolve, DarkPact, DemonicCircle } from '../shared';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    felstorm: Felstorm,
    checklist: Checklist,
    legionStrike: LegionStrike,

    // Core
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    soulshardGraph: SoulShardGraph,

    // Pets
    demoPets: DemoPets,
    petDamageHandler: PetDamageHandler,
    petSummonHandler: PetSummonHandler,
    wildImpEnergyHandler: WildImpEnergyHandler,
    powerSiphonHandler: PowerSiphonHandler,
    demonicTyrantHandler: DemonicTyrantHandler,
    implosionHandler: ImplosionHandler,
    summonOrderNormalizer: SummonOrderNormalizer,
    prepullPetNormalizer: PrepullPetNormalizer,

    // Normalizers
    powerSiphonNormalizer: PowerSiphonNormalizer,
    PowerSiphonBuffCastNormalizer: PowerSiphonBuffCastNormalizer,

    // Talents
    summonDemonicTyrant: SummonDemonicTyrant,
    dreadlash: Dreadlash,
    demonicStrength: DemonicStrength,
    bilescourgeBombers: BilescourgeBombers,
    demonicCalling: DemonicCalling,
    soulConduit: SoulConduit,
    innerDemons: InnerDemons,
    soulStrike: SoulStrike,
    summonVilefiend: SummonVilefiend,
    powerSiphon: PowerSiphon,
    doom: Doom,
    grimoireFelguard: GrimoireFelguard,
    sacrificedSouls: SacrificedSouls,
    dreadCalling: DreadCalling,
    DiabolicRitual: DiabolicRitual,
    DiabolicRitualEmpowers: DiabolicRitualEmpowers,

    // Shared Spells
    unendingResolve: UnendingResolve,
    darkPact: DarkPact,
    demonicCircle: DemonicCircle,

    // Items
    vaultOfTheIncarnates4Set: DemonologyWarlockVaultOfTheIncarnates4Set,
    aberrus2Set: DemonologyWarlockAberrus2Set,

    // Tier
    t31AmirdrassilDemonology: T31AmirdrassilDemonology,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };

  static guide = Guide;
}

export default CombatLogParser;
