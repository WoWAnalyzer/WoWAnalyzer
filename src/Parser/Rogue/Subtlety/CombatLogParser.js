import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import CastEfficiency from './Modules/Features/CastEfficiency';

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
    castEfficiency: CastEfficiency,
    symbolsOfDeathUptime:  SymbolsOfDeathUptime,

    //Talents
    darkShadowContribution: DarkShadowContribution,
    darkShadowEvis: DarkShadowEvis,
  };
}

export default CombatLogParser;
