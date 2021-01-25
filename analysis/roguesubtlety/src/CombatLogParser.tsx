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
  SerratedBoneSpike,
  SpellEnergyCost,
  SpellUsable,
  StealthDamageTracker,
} from '@wowanalyzer/rogue';

import CoreCombatLogParser from 'parser/core/CombatLogParser';

import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import GeneratorFollowingVanish from './modules/core/GeneratorFollowingVanish';

import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/checklist/Module';

//Normalizers
import ShurikenStormNormalizer from './normalizers/ShurikenStormNormalizer';

import CastsInShadowDance from './modules/core/CastsInShadowDance';
import CastsInStealth from './modules/core/CastsInStealth';
import ShadowBladesUptime from './modules/features/ShadowBladesUptime';
import SymbolsOfDeathUptime from './modules/features/SymbolsOfDeathUptime';
import DeepeningShadows from './modules/core/DeepeningShadows';
import ComboPoints from './modules/core/ComboPoints';
import Energy from './modules/core/Energy';
import SymbolsDamageTracker from './modules/core/SymbolsDamageTracker';
import DanceDamageTracker from './modules/core/DanceDamageTracker';
import DarkShadowContribution from './modules/talents/DarkShadow/DarkShadowContribution';
import BlackPowder from './modules/core/BlackPowder';

import AkaarisSoulFragment from './modules/spells/shadowlands/legendaries/AkaarisSoulFragment';
import TheRotten from './modules/spells/shadowlands/legendaries/TheRotten';
import VanishFindWeakness from './modules/features/VanishFindWeakness';

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

    //Talents
    darkShadowContribution: DarkShadowContribution,

    // Covenants
    serratedBoneSpike: SerratedBoneSpike,
    echoingReprimand: EchoingReprimand,
    flagellation: Flagellation,
    sepsis: Sepsis,

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
