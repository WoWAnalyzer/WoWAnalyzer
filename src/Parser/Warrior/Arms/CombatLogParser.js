import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import ColossusSmashUptime from './Modules/BuffDebuff/ColossusSmashUptime';
import TacticianProc from './Modules/BuffDebuff/TacticianProc';


//import RelicTraits from './Modules/Traits/RelicTraits';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // WarriorCore
    damageDone: [DamageDone, {showStatistic: true}],

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    colossusSmashUptime: ColossusSmashUptime,
    tacticianProc: TacticianProc,

    // Talents

    // Traits

    // Items:

  };
}

export default CombatLogParser;
