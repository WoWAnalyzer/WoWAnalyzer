import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import {
  ComboPointDetails,
  ComboPointTracker,
  DeeperDaggers,
  EchoingReprimand,
  EnergyCapTracker,
  EnergyDetails,
  EnergyTracker,
  EssenceOfBloodfang,
  Flagellation,
  InvigoratingShadowdust,
  Sepsis,
  StealthAbilityFollowingSepsis,
  SerratedBoneSpike,
  SpellEnergyCost,
  SpellUsable,
  StealthDamageTracker,
  InstantPoison,
} from '@wowanalyzer/rogue';

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
import Checklist from './modules/features/checklist/Module';
import ShadowBladesUptime from './modules/features/ShadowBladesUptime';
import SymbolsOfDeathUptime from './modules/features/SymbolsOfDeathUptime';
import VanishFindWeakness from './modules/features/VanishFindWeakness';
import AkaarisSoulFragment from './modules/spells/shadowlands/legendaries/AkaarisSoulFragment';
import TheRotten from './modules/spells/shadowlands/legendaries/TheRotten';
import DarkShadowContribution from './modules/talents/DarkShadow/DarkShadowContribution';
import ShurikenStormNormalizer from './normalizers/ShurikenStormNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Core
    abilities: Abilities,
    checklist: Checklist,
    alwaysBeCasting: AlwaysBeCasting,
    spellUsable: SpellUsable,

    //Normalizers
    shurikenStormNormalizer: ShurikenStormNormalizer,

    //Resource
    comboPointTracker: ComboPointTracker,
    comboPointDetails: ComboPointDetails,
    comboPoints: ComboPoints,
    energyTracker: EnergyTracker,
    energyCapTracker: EnergyCapTracker,
    energyDetails: EnergyDetails,
    energy: Energy,
    spellEnergyCost: SpellEnergyCost,

    //Trackers
    symbolsDamageTracker: SymbolsDamageTracker,
    danceDamageTracker: DanceDamageTracker,
    stealthDamageTracker: StealthDamageTracker,
    blackPowder: BlackPowder,

    //Core
    danceCooldownReduction: DeepeningShadows,

    //Casts
    symbolsOfDeathUptime: SymbolsOfDeathUptime,
    shadowBladesUptime: ShadowBladesUptime,
    castsInShadowDance: CastsInShadowDance,
    castsInStealth: CastsInStealth,
    vanishFindWeakness: VanishFindWeakness,
    generatorFollowingVanish: GeneratorFollowingVanish,
    instantPoison: InstantPoison,

    //Talents
    darkShadowContribution: DarkShadowContribution,

    // Covenants
    serratedBoneSpike: SerratedBoneSpike,
    echoingReprimand: EchoingReprimand,
    flagellation: Flagellation,
    sepsis: Sepsis,
    stealthAbilityFollowingSepsis: StealthAbilityFollowingSepsis,

    // Legendaries
    akaarisSoulFragment: AkaarisSoulFragment,
    theRotten: TheRotten,
    essenceOfBloodfang: EssenceOfBloodfang,
    invigoratingShadowdust: InvigoratingShadowdust,

    // Conduits
    deeperDaggers: DeeperDaggers,

    // Racials
    arcaneTorrent: [ArcaneTorrent, { gcd: 1000 }] as const,
  };
}

export default CombatLogParser;
