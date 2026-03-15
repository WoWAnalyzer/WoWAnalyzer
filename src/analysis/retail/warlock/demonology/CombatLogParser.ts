import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import LegionStrike from './modules/features/LegionStrike';
import DemoPets from './modules/pets/DemoPets';
import DemonicTyrant from './modules/features/DemonicTyrant';
import PetDamageHandler from './modules/pets/DemoPets/PetDamageHandler';
import PetSummonHandler from './modules/pets/DemoPets/PetSummonHandler';
import PowerSiphonHandler from './modules/pets/DemoPets/PowerSiphonHandler';
import DemonicTyrantHandler from './modules/pets/DemoPets/DemonicTyrantHandler';
import ImplosionHandler from './modules/pets/DemoPets/ImplosionHandler';
import SummonOrderNormalizer from './modules/pets/normalizers/SummonOrderNormalizer';
import PrepullPetNormalizer from './modules/pets/normalizers/PrepullPetNormalizer';
import ImpLordNormalizer from './modules/pets/normalizers/ImpLordNormalizer';
import FelRavagerNormalizer from './modules/pets/normalizers/FelRavagerNormalizer';
import DemonicCalling from './modules/talents/DemonicCalling';
import Doom from './modules/talents/Doom';
import Dreadlash from './modules/talents/Dreadlash';
import InnerDemons from './modules/talents/InnerDemons';
import PowerSiphon from './modules/talents/PowerSiphon';
import SacrificedSouls from './modules/talents/SacrificedSouls';
import SummonVilefiend from './modules/talents/SummonVilefiend';
import DiabolicRitual from './modules/talents/DiabolicRitual';
import DiabolicRitualEmpowers from './modules/talents/DiabolicRitualEmpowers';
import SoulShardDetails from '../shared/resources/SoulShardDetails';
import SoulShardTracker from '../shared/resources/SoulShardTracker';
import SoulShardGraph from '../shared/resources/SoulShardGraph';
import { UnendingResolve, DarkPact, DemonicCircle } from '../shared';
import Guide from './Guide';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    legionStrike: LegionStrike,
    DemonicTyrant: DemonicTyrant,

    // Core
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    soulShardGraph: SoulShardGraph,

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

    // Tier / Racial
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };

  static guide = Guide;
}

export default CombatLogParser;
