import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import CoreChanneling from 'parser/shared/normalizers/Channeling';

// import Abilities from './modules/features/Abilities';

class CombatLogParser extends CoreCombatLogParser {
  // static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Mana Tab
    manaTracker: ManaTracker,

    // Core
    lowHealthHealing: LowHealthHealing,
    channeling: CoreChanneling,

    // Generic healer things
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,
  };
}

export default CombatLogParser;
