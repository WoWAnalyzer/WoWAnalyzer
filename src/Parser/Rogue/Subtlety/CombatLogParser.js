import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import DamageDone from 'Parser/Core/Modules/DamageDone';
import Abilities from './Modules/Features/Abilities';

import ShadowBladesUptime from "./Modules/Features/ShadowBladesUptime";
import ShadowDance from "./Modules/Features/ShadowDance";
import SymbolsOfDeathUptime from "./Modules/Features/SymbolsOfDeathUptime";
import DarkShadowContribution from "./Modules/Talents/DarkShadowContribution";
import DarkShadowEvis from "./Modules/Talents/DarkShadowEvis";

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Feature
    damageDone: [DamageDone, { showStatistic: true }],
    shadowBladesUptime : ShadowBladesUptime,
    shadowDance: ShadowDance,
    abilities: Abilities,
    symbolsOfDeathUptime:  SymbolsOfDeathUptime,

    //Talents
    darkShadowContribution: DarkShadowContribution,
    darkShadowEvis: DarkShadowEvis,
  };
}

export default CombatLogParser;
