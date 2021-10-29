import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

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
import PetTimelineTab from './modules/pets/PetTimelineTab';
import SoulShardDetails from './modules/soulshards/SoulShardDetails';
import SoulShardTracker from './modules/soulshards/SoulShardTracker';
import TalentStatisticBox from './modules/talents';
import BilescourgeBombers from './modules/talents/BilescourgeBombers';
import DemonicCalling from './modules/talents/DemonicCalling';
import DemonicConsumption from './modules/talents/DemonicConsumption';
import DemonicStrength from './modules/talents/DemonicStrength';
import Doom from './modules/talents/Doom';
import Dreadlash from './modules/talents/Dreadlash';
import FromTheShadows from './modules/talents/FromTheShadows';
import GrimoireFelguard from './modules/talents/GrimoireFelguard';
import InnerDemons from './modules/talents/InnerDemons';
import NetherPortal from './modules/talents/NetherPortal';
import PowerSiphonNormalizer from './modules/talents/normalizers/PowerSiphonNormalizer';
import PowerSiphon from './modules/talents/PowerSiphon';
import SacrificedSouls from './modules/talents/SacrificedSouls';
import SoulConduit from './modules/talents/SoulConduit';
import SoulStrike from './modules/talents/SoulStrike';
import SummonVilefiend from './modules/talents/SummonVilefiend';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    felstorm: Felstorm,
    checklist: Checklist,
    summonDemonicTyrant: SummonDemonicTyrant,
    legionStrike: LegionStrike,

    // Core
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,

    // Pets
    demoPets: DemoPets,
    petDamageHandler: PetDamageHandler,
    petSummonHandler: PetSummonHandler,
    wildImpEnergyHandler: WildImpEnergyHandler,
    powerSiphonHandler: PowerSiphonHandler,
    demonicTyrantHandler: DemonicTyrantHandler,
    implosionHandler: ImplosionHandler,
    petTimelineTab: PetTimelineTab,
    summonOrderNormalizer: SummonOrderNormalizer,
    prepullPetNormalizer: PrepullPetNormalizer,

    // Normalizers
    powerSiphonNormalizer: PowerSiphonNormalizer,

    // Talents
    talents: TalentStatisticBox,
    dreadlash: Dreadlash,
    demonicStrength: DemonicStrength,
    bilescourgeBombers: BilescourgeBombers,
    demonicCalling: DemonicCalling,
    soulConduit: SoulConduit,
    innerDemons: InnerDemons,
    fromTheShadows: FromTheShadows,
    soulStrike: SoulStrike,
    summonVilefiend: SummonVilefiend,
    powerSiphon: PowerSiphon,
    doom: Doom,
    grimoireFelguard: GrimoireFelguard,
    sacrificedSouls: SacrificedSouls,
    demonicConsumption: DemonicConsumption,
    netherPortal: NetherPortal,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
}

export default CombatLogParser;
