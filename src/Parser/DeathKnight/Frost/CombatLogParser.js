import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
//import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import FrostFeverUptime from './Modules/Features/FrostFeverUptime';
import WastedRimeProcs from './Modules/Features/WastedRimeProcs';
import HardHowlingBlastCasts from './Modules/Features/HardHowlingBlastCasts';

import ColdHeart from './Modules/Items/Legendaries/ColdHeart';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    damageDone: [DamageDone, { showStatistic: true }],

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    //cooldownThroughputTracker: CooldownThroughputTracker,
    HardHowlingBlastCasts: HardHowlingBlastCasts,

    // DOT
    frostfeverUptime: FrostFeverUptime,

    // PROCS
    WastedRimeProcs: WastedRimeProcs,

    //Items
    coldHeart: ColdHeart,
  };
}

export default CombatLogParser;
