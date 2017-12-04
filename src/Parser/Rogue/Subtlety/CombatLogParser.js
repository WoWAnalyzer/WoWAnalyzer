import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import DamageDone from 'Parser/Core/Modules/DamageDone';
import Abilities from './Modules/Features/Abilities';

import ShadowBladesUptime from "./Modules/Features/ShadowBladesUptime";
import SymbolsOfDeathUptime from "./Modules/Features/SymbolsOfDeathUptime";
import ComboPointDetails from './Modules/RogueCore/ComboPointDetails';
import ComboPointTracker from './Modules/RogueCore/ComboPointTracker';
import EnergyDetails from './Modules/RogueCore/EnergyDetails';
import EnergyTracker from './Modules/RogueCore/EnergyTracker';
import SymbolsDamageTracker from './Modules/RogueCore/SymbolsDamageTracker';
import DanceDamageTracker from './Modules/RogueCore/DanceDamageTracker';
import DarkShadowNightblade from './Modules/Talents/DarkShadow/DarkShadowNightblade';
import DarkShadowContribution from "./Modules/Talents/DarkShadow/DarkShadowContribution";
import DarkShadowEvis from "./Modules/Talents/DarkShadow/DarkShadowEvis";
import DeathFromAbove from "./Modules/Talents/DFA/DeathFromAbove";
import NightbladeDuringSymbols from './Modules/BaseRotation/NightbladeDuringSymbols';
import CastsInShadowDance from './Modules/BaseRotation/CastsInShadowDance';
import MantleDamageTracker from './Modules/Legendaries/MantleDamageTracker';
import DeathFromAboveMantle from './Modules/Talents/DFA/DeathFromAboveMantle';
import T21_2P from './Modules/Items/T21_2P';
import DanceCooldownReduction from './Modules/RogueCore/DanceCooldownReduction';
import DenialOfHalfGiants from './Modules/Legendaries/DenialOfHalfGiants';
import DarkShadowSpecterOfBetrayal from './Modules/Talents/DarkShadow/DarkShadowSpecterOfBetrayal';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Feature
    damageDone: [DamageDone, { showStatistic: true }],
    shadowBladesUptime : ShadowBladesUptime,
    abilities: Abilities,
    symbolsOfDeathUptime:  SymbolsOfDeathUptime,

    //Resource
    comboPointTracker: ComboPointTracker,
    comboPointDetails: ComboPointDetails,
    energyTracker: EnergyTracker,
    energyDetails: EnergyDetails,

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
