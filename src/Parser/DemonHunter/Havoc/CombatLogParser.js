import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CastEfficiency from './Modules/Features/CastEfficiency';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';

import Momentum from './Modules/Statistics/Spells/Momentum';
import Nemesis from './Modules/Statistics/Spells/Nemesis';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    damageDone: [DamageDone, { showStatistic: true }],

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    castEfficiency: CastEfficiency,
    cooldownThroughputTracker: CooldownThroughputTracker,

    // Spells
    momentum: Momentum,
    nemesis: Nemesis,
  };
}

export default CombatLogParser;
