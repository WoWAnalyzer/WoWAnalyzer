import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';
import VirulentPlagueUptime from './Modules/Features/VirulentPlagueUptime';
import FesteringStrike from './Modules/Features/FesteringStrike';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    damageDone: [DamageDone, { showStatistic: true }],

    // Features
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
    virulentPlagueUptime: VirulentPlagueUptime, 
    festeringStrike: FesteringStrike,
  };
}

export default CombatLogParser;
