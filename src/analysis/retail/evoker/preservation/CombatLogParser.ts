import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';

import Abilities from './modules/Abilities';
import LivingFlame from './modules/core/LivingFlame';
import DreamBreath from './modules/talents/DreamBreath';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    lowHealthHealing: LowHealthHealing,
    abilities: Abilities,
    // Generic healer things
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,

    manaTracker: ManaTracker,

    dreamBreath: DreamBreath,
    livingFlame: LivingFlame,
  };
}

export default CombatLogParser;
