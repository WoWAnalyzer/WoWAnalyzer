import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import DamageDone from 'Parser/Core/Modules/DamageDone';
import Abilities from './Modules/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Checklist from './Modules/Features/Checklist/Module';

import ComboPointDetails from '../Common/Resources/ComboPointDetails';
import ComboPointTracker from '../Common/Resources/ComboPointTracker';
import EnergyDetails from '../Common/Resources/EnergyDetails';
import EnergyTracker from '../Common/Resources/EnergyTracker';
import StealthDamageTracker from '../Common/CastTracker/StealthDamageTracker';
import MantleDamageTracker from '../Common/Legendaries/MantleDamageTracker';
import SoulOfTheShadowblade from '../Common/Legendaries/SoulOfTheShadowblade';
import InsigniaOfRavenholdt from '../Common/Legendaries/InsigniaOfRavenholdt';
import DreadlordsDeceit from '../Common/Legendaries/DreadlordsDeceit';
import MantleOfTheMasterAssassin from '../Common/Legendaries/MantleOfTheMasterAssassin';
import EnergyCapTracker from '../Common/Resources/EnergyCapTracker';
import SpellEnergyCost from '../Common/Resources/SpellEnergyCost';

import NightbladeDuringSymbols from './Modules/BaseRotation/NightbladeDuringSymbols';
import CastsInShadowDance from './Modules/BaseRotation/CastsInShadowDance';
import NightbladeUptime from './Modules/BaseRotation/NightbladeUptime';
import CastsInStealth from './Modules/BaseRotation/CastsInStealth';
import ShadowBladesUptime from "./Modules/Features/ShadowBladesUptime";
import SymbolsOfDeathUptime from "./Modules/Features/SymbolsOfDeathUptime";
import DeepeningShadows from './Modules/RogueCore/DeepeningShadows';
import ComboPoints from './Modules/RogueCore/ComboPoints';
import Energy from './Modules/RogueCore/Energy';
import SymbolsDamageTracker from './Modules/RogueCore/SymbolsDamageTracker';
import DanceDamageTracker from './Modules/RogueCore/DanceDamageTracker';
import DarkShadowNightblade from './Modules/Talents/DarkShadow/DarkShadowNightblade';
import DarkShadowContribution from "./Modules/Talents/DarkShadow/DarkShadowContribution";
import FindWeakness from "./Modules/Talents/FindWeakness";
import T21_2P from './Modules/Items/T21_2P';
import DenialOfHalfGiants from './Modules/Legendaries/DenialOfHalfGiants';
import FirstOfTheDead from './Modules/Legendaries/FirstOfTheDead';
import ShadowSatyrsWalk from './Modules/Legendaries/ShadowSatyrsWalk';

import DarkShadowSpecterOfBetrayal from './Modules/Talents/DarkShadow/DarkShadowSpecterOfBetrayal';

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
