import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import DamageTaken from 'Parser/Core/Modules/DamageTaken';


import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
//import CooldownTracker from './Modules/Features/CooldownTracker';

//import T20_2pc from './Modules/Items/T20_2pc';
//import T20_4pc from './Modules/Items/T20_4pc';


class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    damageTaken: [DamageTaken, { showStatistic: true }],
    damageDone: [DamageDone, { showStatistic: true }],
    healingDone: [HealingDone, { showStatistic: true }],

    // Paladin Core

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    //cooldownTracker: CooldownTracker,


    // Talents


    // Traits


    // Items:
    //t20_2pc: T20_2pc,
    //t20_4pc: T20_4pc,
  };
}

export default CombatLogParser;
