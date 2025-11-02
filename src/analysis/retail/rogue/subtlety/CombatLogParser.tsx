import {
  ComboPointDetails,
  ComboPointTracker,
  DeeperDaggers,
  EchoingReprimand,
  EnergyCapTracker,
  EnergyDetails,
  EnergyTracker,
  SpellEnergyCost,
  StealthDamageTracker,
  InstantPoison,
} from 'analysis/retail/rogue/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import ComboPointGraph from 'analysis/retail/rogue/shared/ComboPointGraph';
import Abilities from './modules/Abilities';
import BlackPowder from './modules/core/BlackPowder';
import CastsInShadowDance from './modules/core/CastsInShadowDance';
import CastsInStealth from './modules/core/CastsInStealth';
import ComboPoints from './modules/core/ComboPoints';
import DanceDamageTracker from './modules/core/DanceDamageTracker';
import DeepeningShadows from './modules/core/DeepeningShadows';
import Energy from './modules/core/Energy';
import GeneratorFollowingVanish from './modules/core/GeneratorFollowingVanish';
import SymbolsDamageTracker from './modules/core/SymbolsDamageTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import ShadowBladesUptime from './modules/features/ShadowBladesUptime';
import SymbolsOfDeathUptime from './modules/features/SymbolsOfDeathUptime';
import VanishFindWeakness from './modules/features/VanishFindWeakness';
import TheRotten from './modules/talents/TheRotten';
import DarkShadowContribution from './modules/talents/DarkShadow/DarkShadowContribution';
import ShurikenStormNormalizer from './normalizers/ShurikenStormNormalizer';
import Guide from './Guide';
import Shadowstrike from './modules/spells/Shadowstrike';
import SymbolsOfDeath from './modules/spells/SymbolsOfDeath';
import Backstab from './modules/spells/Backstab';
import Eviscerate from './modules/spells/Eviscerate';
import EnergyGraph from 'analysis/retail/rogue/shared/EnergyGraph';
import BuilderUse from './modules/core/BuilderUse';
import FinisherUse from './modules/core/FinisherUse';
import ShadowDance from './modules/spells/ShadowDance';
import RuptureUptime from './modules/spells/Rupture';
import FlagellationAnalysis from './modules/spells/Flagellation';
import { Flagellation } from 'analysis/retail/rogue/shared';
import ShadowBlades from './modules/spells/ShadowBlades';
import { ColdBlood } from 'analysis/retail/rogue/shared';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Core
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    danceCooldownReduction: DeepeningShadows,
    builderUse: BuilderUse,
    finisherUse: FinisherUse,

    //Normalizers
    shurikenStormNormalizer: ShurikenStormNormalizer,

    //Resource
    comboPointTracker: ComboPointTracker,
    comboPointDetails: ComboPointDetails,
    comboPointGraph: ComboPointGraph,
    comboPoints: ComboPoints,
    energyTracker: EnergyTracker,
    energyCapTracker: EnergyCapTracker,
    energyDetails: EnergyDetails,
    energyGraph: EnergyGraph,
    energy: Energy,
    spellEnergyCost: SpellEnergyCost,

    //Trackers
    symbolsDamageTracker: SymbolsDamageTracker,
    danceDamageTracker: DanceDamageTracker,
    stealthDamageTracker: StealthDamageTracker,

    //Spells
    shadowstrike: Shadowstrike,
    symbolsOfDeath: SymbolsOfDeath,
    backstab: Backstab,
    eviscerate: Eviscerate,
    shadowDance: ShadowDance,
    flagellationAnalysis: FlagellationAnalysis,
    shadowBlades: ShadowBlades,
    flagellation: Flagellation,
    coldBlood: ColdBlood,

    //Casts
    symbolsOfDeathUptime: SymbolsOfDeathUptime,
    shadowBladesUptime: ShadowBladesUptime,
    castsInShadowDance: CastsInShadowDance,
    castsInStealth: CastsInStealth,
    vanishFindWeakness: VanishFindWeakness,
    generatorFollowingVanish: GeneratorFollowingVanish,
    instantPoison: InstantPoison,
    ruptureUptime: RuptureUptime,

    //Talents
    blackPowder: BlackPowder,
    darkShadowContribution: DarkShadowContribution,
    theRotten: TheRotten,
    deeperDaggers: DeeperDaggers,
    echoingReprimand: EchoingReprimand,

    // Covenants

    // Racials
    arcaneTorrent: [ArcaneTorrent, { gcd: 1000 }] as const,
  };
  static guide = Guide;
}

export default CombatLogParser;
