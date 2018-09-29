import CoreCombatLogParser from 'parser/core/CombatLogParser';

import DamageDone from 'parser/core/modules/DamageDone';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/checklist/Module';

import ComboPointDetails from '../shared/resources/ComboPointDetails';
import ComboPointTracker from '../shared/resources/ComboPointTracker';
import EnergyDetails from '../shared/resources/EnergyDetails';
import EnergyTracker from '../shared/resources/EnergyTracker';
import StealthDamageTracker from '../shared/casttracker/StealthDamageTracker';
import MantleDamageTracker from '../shared/legendaries/MantleDamageTracker';
import SoulOfTheShadowblade from '../shared/legendaries/SoulOfTheShadowblade';
import InsigniaOfRavenholdt from '../shared/legendaries/InsigniaOfRavenholdt';
import DreadlordsDeceit from '../shared/legendaries/DreadlordsDeceit';
import MantleOfTheMasterAssassin from '../shared/legendaries/MantleOfTheMasterAssassin';
import EnergyCapTracker from '../shared/resources/EnergyCapTracker';
import SpellEnergyCost from '../shared/resources/SpellEnergyCost';

import NightbladeDuringSymbols from './modules/core/NightbladeDuringSymbols';
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
import T21_2P from './modules/items/T21_2P';
import DenialOfHalfGiants from './modules/legendaries/DenialOfHalfGiants';
import FirstOfTheDead from './modules/legendaries/FirstOfTheDead';
import ShadowSatyrsWalk from './modules/legendaries/ShadowSatyrsWalk';

import DarkShadowSpecterOfBetrayal from './modules/talents/DarkShadow/DarkShadowSpecterOfBetrayal';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Core
    damageDone: [DamageDone, { showStatistic: true }],
    abilities: Abilities,
    checklist: Checklist,
    alwaysBeCasting: AlwaysBeCasting,

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
    mantleDamageTracker: MantleDamageTracker,

    //Core
    danceCooldownReduction: DeepeningShadows,

    //Items
    t21_2P: T21_2P,
    darkShadowSpecterOfBetrayal: DarkShadowSpecterOfBetrayal,

    //Legendaries
    denialOfHalfGiants: DenialOfHalfGiants,
    firstOfTheDead: FirstOfTheDead,
    mantleOfTheMasterAssassin: MantleOfTheMasterAssassin,
    shadowSatyrsWalk: ShadowSatyrsWalk,
    soulOfTheShadowblade: SoulOfTheShadowblade,
    insigniaOfRavenholdt: InsigniaOfRavenholdt,
    dreadlordsDeceit: DreadlordsDeceit,

    //Casts
    symbolsOfDeathUptime:  SymbolsOfDeathUptime,
    shadowBladesUptime : ShadowBladesUptime,
    nightbladeUptime: NightbladeUptime,
    nightbladeDuringSymbols: NightbladeDuringSymbols,
    castsInShadowDance: CastsInShadowDance,
    castsInStealth: CastsInStealth,

    //Talents
    darkShadowContribution: DarkShadowContribution,
    darkShadowNightblade: DarkShadowNightblade,
    findWeakness: FindWeakness,
  };
}

export default CombatLogParser;
