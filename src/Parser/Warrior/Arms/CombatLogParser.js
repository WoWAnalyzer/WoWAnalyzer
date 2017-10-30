import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';
import ColossusSmashUptime from './Modules/BuffDebuff/ColossusSmashUptime';
import TacticianProc from './Modules/BuffDebuff/TacticianProc';


//import RelicTraits from './Modules/Traits/RelicTraits';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // WarriorCore
    damageDone: [DamageDone, {showStatistic: true}],

    // Features
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
    colossusSmashUptime: ColossusSmashUptime,
    tacticianProc: TacticianProc,

    // Talents

    // Traits

    // Items:

  };
}

export default CombatLogParser;
