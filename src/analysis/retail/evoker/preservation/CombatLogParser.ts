import MainCombatLogParser from 'parser/core/CombatLogParser';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';

import Abilities from './modules/Abilities';
import DreamBreath from './modules/talents/DreamBreath';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    // Generic healer things
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,

    manaTracker: ManaTracker,

    lowHealthHealing: LowHealthHealing,

    abilities: Abilities,
    dreamBreath: DreamBreath,
  };
}

export default CombatLogParser;
