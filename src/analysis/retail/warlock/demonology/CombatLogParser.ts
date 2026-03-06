import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import LegionStrike from './modules/features/LegionStrike';
import DemoPets from './modules/pets/DemoPets';
import DemonicTyrantHandler from './modules/pets/DemoPets/DemonicTyrantHandler';
import ImplosionHandler from './modules/pets/DemoPets/ImplosionHandler';
import PetDamageHandler from './modules/pets/DemoPets/PetDamageHandler';
import PetSummonHandler from './modules/pets/DemoPets/PetSummonHandler';
import PowerSiphonHandler from './modules/pets/DemoPets/PowerSiphonHandler';
import PrepullPetNormalizer from './modules/pets/normalizers/PrepullPetNormalizer';
import SummonOrderNormalizer from './modules/pets/normalizers/SummonOrderNormalizer';
import SoulShardDetails from './modules/resources/SoulShardDetails';
import SoulShardTracker from './modules/resources/SoulShardTracker';
import SoulShardGraph from './modules/resources/SoulShardGraph';
import DemonicCalling from './modules/talents/DemonicCalling';
import Doom from './modules/talents/Doom';
import Dreadlash from './modules/talents/Dreadlash';
import InnerDemons from './modules/talents/InnerDemons';
import PowerSiphonNormalizer from './modules/talents/normalizers/PowerSiphonNormalizer';
import PowerSiphonBuffCastNormalizer from './modules/talents/normalizers/PowerSiphonBuffCastNormalizer';
import PowerSiphon from './modules/talents/PowerSiphon';
import SacrificedSouls from './modules/talents/SacrificedSouls';
import SummonVilefiend from './modules/talents/SummonVilefiend';
import DiabolicRitual from './modules/talents/DiabolicRitual';
import DiabolicRitualEmpowers from './modules/talents/DiabolicRitualEmpowers';
import Guide from './Guide';
import TWW2TierSet from './modules/thewarwithin/tier/TWW2TierSet';
import TWW3DiabolistTierSet from './modules/tier/TWW3DiabolistTierSet';
import TWW3SoulHarvesterTierSet from './modules/tier/TWW3SoulHarvesterTierSet';
import { UnendingResolve, DarkPact, DemonicCircle } from '../shared';
import ImpLordNormalizer from './modules/pets/normalizers/ImpLordNormalizer';
import FelRavagerNormalizer from './modules/pets/normalizers/FelRavagerNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    legionStrike: LegionStrike,

    // Core
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    soulshardGraph: SoulShardGraph,

    // Pets
    demoPets: DemoPets,
    petDamageHandler: PetDamageHandler,
    petSummonHandler: PetSummonHandler,
    powerSiphonHandler: PowerSiphonHandler,
    demonicTyrantHandler: DemonicTyrantHandler,
    implosionHandler: ImplosionHandler,
    summonOrderNormalizer: SummonOrderNormalizer,
    prepullPetNormalizer: PrepullPetNormalizer,
    ImpLordNormalizer: ImpLordNormalizer,
    FelRavagerNormalizer: FelRavagerNormalizer,

    // Normalizers
    powerSiphonNormalizer: PowerSiphonNormalizer,
    PowerSiphonBuffCastNormalizer: PowerSiphonBuffCastNormalizer,

    // Talents
    dreadlash: Dreadlash,
    demonicCalling: DemonicCalling,
    innerDemons: InnerDemons,
    summonVilefiend: SummonVilefiend,
    powerSiphon: PowerSiphon,
    doom: Doom,

    sacrificedSouls: SacrificedSouls,
    DiabolicRitual: DiabolicRitual,
    DiabolicRitualEmpowers: DiabolicRitualEmpowers,

    // Shared Spells
    unendingResolve: UnendingResolve,
    darkPact: DarkPact,
    demonicCircle: DemonicCircle,

    // Tier
    tww2TierSet: TWW2TierSet,
    tww3DiabolistTierSet: TWW3DiabolistTierSet,
    tww3SoulHarvesterTierSet: TWW3SoulHarvesterTierSet,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };

  static guide = Guide;
}

export default CombatLogParser;
