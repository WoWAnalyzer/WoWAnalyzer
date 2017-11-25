import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import DamageDone from 'Parser/Core/Modules/DamageDone';
import Abilities from './Modules/Features/Abilities';

import ShadowBladesUptime from "./Modules/Features/ShadowBladesUptime";
import ShadowDance from "./Modules/RogueCore/ShadowDance";
import SymbolsOfDeathUptime from "./Modules/Features/SymbolsOfDeathUptime";
import DarkShadowContribution from "./Modules/Talents/DarkShadow/DarkShadowContribution";
import DarkShadowEvis from "./Modules/Talents/DarkShadow/DarkShadowEvis";
import ComboPointDetails from './Modules/RogueCore/ComboPointDetails';
import ComboPointTracker from './Modules/RogueCore/ComboPointTracker';
import EnergyDetails from './Modules/RogueCore/EnergyDetails';
import EnergyTracker from './Modules/RogueCore/EnergyTracker';
import NightbladeCastTracker from './Modules/RogueCore/NightbladeCastTracker';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Feature
    damageDone: [DamageDone, { showStatistic: true }],
    shadowBladesUptime : ShadowBladesUptime,
    shadowDance: ShadowDance,
    abilities: Abilities,
    symbolsOfDeathUptime:  SymbolsOfDeathUptime,

    //Resource
    comboPointTracker: ComboPointTracker,
    comboPointDetails: ComboPointDetails,
    energyTracker: EnergyTracker,
    energyDetails: EnergyDetails,

    //Casts
    nightbladeCastTracker: NightbladeCastTracker,
    
    //Talents
    darkShadowContribution: DarkShadowContribution,
    darkShadowEvis: DarkShadowEvis,
  };
}

export default CombatLogParser;
