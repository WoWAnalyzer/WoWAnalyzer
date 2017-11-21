import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import DamageDone from 'Parser/Core/Modules/DamageDone';
import Abilities from './Modules/Features/Abilities';

import ShadowBladesUptime from "./Modules/Features/ShadowBladesUptime";
import ShadowDance from "./Modules/Features/ShadowDance";
import SymbolsOfDeathUptime from "./Modules/Features/SymbolsOfDeathUptime";
import DarkShadowContribution from "./Modules/Talents/DarkShadowContribution";
import DarkShadowEvis from "./Modules/Talents/DarkShadowEvis";
import ComboPointDetails from './Modules/RogueCore/ComboPointDetails';
import ComboPointTracker from './Modules/RogueCore/ComboPointTracker';
import EnergyDetails from './Modules/RogueCore/EnergyDetails';
import EnergyTracker from './Modules/RogueCore/EnergyTracker';

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
    
    //Talents
    darkShadowContribution: DarkShadowContribution,
    darkShadowEvis: DarkShadowEvis,
  };
}

export default CombatLogParser;
