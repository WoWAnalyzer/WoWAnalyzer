import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import DamageDone from 'Parser/Core/Modules/DamageDone';
import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';

import ShadowBladesUptime from "./Modules/Features/ShadowBladesUptime";
import SymbolsOfDeathUptime from "./Modules/Features/SymbolsOfDeathUptime";
import ComboPointDetails from '../Common/Resources/ComboPointDetails';
import ComboPointTracker from '../Common/Resources/ComboPointTracker';
import ComboPoints from './Modules/RogueCore/ComboPoints';
import EnergyDetails from '../Common/Resources/EnergyDetails';
import EnergyTracker from '../Common/Resources/EnergyTracker';
import Energy from './Modules/RogueCore/Energy';
import SymbolsDamageTracker from './Modules/RogueCore/SymbolsDamageTracker';
import DanceDamageTracker from './Modules/RogueCore/DanceDamageTracker';
import DarkShadowNightblade from './Modules/Talents/DarkShadow/DarkShadowNightblade';
import DarkShadowContribution from "./Modules/Talents/DarkShadow/DarkShadowContribution";
import DarkShadowEvis from "./Modules/Talents/DarkShadow/DarkShadowEvis";
import DeathFromAbove from "./Modules/Talents/DFA/DeathFromAbove";
import NightbladeDuringSymbols from './Modules/BaseRotation/NightbladeDuringSymbols';
import CastsInShadowDance from './Modules/BaseRotation/CastsInShadowDance';
import MantleDamageTracker from '../Common/Legendaries/MantleDamageTracker';
import DeathFromAboveMantle from './Modules/Talents/DFA/DeathFromAboveMantle';
import T21_2P from './Modules/Items/T21_2P';
import DanceCooldownReduction from './Modules/RogueCore/DanceCooldownReduction';
import DenialOfHalfGiants from './Modules/Legendaries/DenialOfHalfGiants';
import FirstOfTheDead from './Modules/Legendaries/FirstOfTheDead';
import MantleOfTheMasterAssassin from '../Common/Legendaries/MantleOfTheMasterAssassin';
import ShadowSatyrsWalk from './Modules/Legendaries/ShadowSatyrsWalk';
import SoulOfTheShadowblade from '../Common/Legendaries/SoulOfTheShadowblade';
import InsigniaOfRavenholdt from '../Common/Legendaries/InsigniaOfRavenholdt';
import DreadlordsDeceit from '../Common/Legendaries/DreadlordsDeceit';

import DarkShadowSpecterOfBetrayal from './Modules/Talents/DarkShadow/DarkShadowSpecterOfBetrayal';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Feature
    damageDone: [DamageDone, { showStatistic: true }],
    shadowBladesUptime : ShadowBladesUptime,
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    symbolsOfDeathUptime:  SymbolsOfDeathUptime,

    //Resource
    comboPointTracker: ComboPointTracker,
    comboPointDetails: ComboPointDetails,
    comboPoints: ComboPoints,
    energyTracker: EnergyTracker,
    energyDetails: EnergyDetails,
    energy: Energy,

    //Trackers
    symbolsDamageTracker: SymbolsDamageTracker,
    danceDamageTracker: DanceDamageTracker,
    mantleDamageTracker: MantleDamageTracker,

    //Core
    danceCooldownReduction: DanceCooldownReduction,

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
    nightbladeDuringSymbols: NightbladeDuringSymbols,
    castsInShadowDance: CastsInShadowDance,
    DeathFromAbove: DeathFromAbove,
    DeathFromAboveMantle: DeathFromAboveMantle,
    
    //Talents
    darkShadowContribution: DarkShadowContribution,
    darkShadowEvis: DarkShadowEvis,
    darkShadowNightblade: DarkShadowNightblade,
  };
}

export default CombatLogParser;
