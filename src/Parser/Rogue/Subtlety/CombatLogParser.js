import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import CastEfficiency from './Modules/Features/CastEfficiency';

import { ShadowBladesUptime, ShadowDance, DarkShadowContribution, DarkShadowEvis, SymbolsOfDeathUptime } from './Modules';

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
