import CoreCombatLogParser from 'parser/core/CombatLogParser';

import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/checklist/Module';
import SpellUsable from '../shared/SpellUsable';

//Normalizers
import ShurikenStormNormalizer from './normalizers/ShurikenStormNormalizer';

import ComboPointDetails from '../shared/resources/ComboPointDetails';
import ComboPointTracker from '../shared/resources/ComboPointTracker';
import EnergyDetails from '../shared/resources/EnergyDetails';
import EnergyTracker from '../shared/resources/EnergyTracker';
import StealthDamageTracker from '../shared/casttracker/StealthDamageTracker';
import EnergyCapTracker from '../shared/resources/EnergyCapTracker';
import SpellEnergyCost from '../shared/resources/SpellEnergyCost';

import NightbladeDuringSymbols from './modules/core/NightbladeDuringSymbols';
import NightbladeEarlyRefresh from './modules/core/NightbladeEarlyRefresh';
import CastsInShadowDance from './modules/core/CastsInShadowDance';
import NightbladeUptime from './modules/core/NightbladeUptime';
import CastsInStealth from './modules/core/CastsInStealth';
import ShadowBladesUptime from "./modules/features/ShadowBladesUptime";
import SymbolsOfDeathUptime from "./modules/features/SymbolsOfDeathUptime";
import DeepeningShadows from './modules/core/DeepeningShadows';
import ComboPoints from './modules/core/ComboPoints';
import Energy from './modules/core/Energy';
import SymbolsDamageTracker from './modules/core/SymbolsDamageTracker';
import DanceDamageTracker from './modules/core/DanceDamageTracker';
import DarkShadowNightblade from './modules/talents/DarkShadow/DarkShadowNightblade';
import DarkShadowContribution from "./modules/talents/DarkShadow/DarkShadowContribution";
import FindWeakness from "./modules/talents/FindWeakness";

import Perforate from "./modules/azerite/Perforate";

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

    //Core
    danceCooldownReduction: DeepeningShadows,

    //Casts
    symbolsOfDeathUptime:  SymbolsOfDeathUptime,
    shadowBladesUptime : ShadowBladesUptime,
    nightbladeUptime: NightbladeUptime,
    nightbladeDuringSymbols: NightbladeDuringSymbols,
    nightbladeEarlyRefresh: NightbladeEarlyRefresh,
    castsInShadowDance: CastsInShadowDance,
    castsInStealth: CastsInStealth,

    //Talents
    darkShadowContribution: DarkShadowContribution,
    darkShadowNightblade: DarkShadowNightblade,
    findWeakness: FindWeakness,

    // Traits
    perforate: Perforate,

    // Racials
    arcaneTorrent: [ArcaneTorrent, { gcd: 1000 }] as const,
  };
}

export default CombatLogParser;
