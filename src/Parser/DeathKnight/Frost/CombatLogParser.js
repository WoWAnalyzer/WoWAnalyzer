import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
//import CooldownTracker from './Modules/Features/CooldownTracker';
import FrostFeverUptime from './Modules/Features/FrostFeverUptime';
import WastedRimeProcs from './Modules/Features/WastedRimeProcs';
import HardHowlingBlastCasts from './Modules/Features/HardHowlingBlastCasts';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    damageDone: [DamageDone, { showStatistic: true }],

    // Features
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    //cooldownTracker: CooldownTracker,
    HardHowlingBlastCasts: HardHowlingBlastCasts,

    // DOT
    frostfeverUptime: FrostFeverUptime,

    // PROCS
    WastedRimeProcs: WastedRimeProcs,
  };
}

export default CombatLogParser;
