import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';

import Abilities from './modules/Abilities';
import LivingFlame from '../shared/modules/core/LivingFlame';
import DreamBreath from './modules/talents/DreamBreath';
import MasteryEffectiveness from './modules/core/MasteryEffectiveness';
import Spiritbloom from './modules/talents/Spiritbloom';
import HotAttributor from './modules/core/HotAttributor';
import HotTrackerPrevoker from './modules/core/HotTrackerPrevoker';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';
import HotApplicationNormalizer from './normalizers/HotApplicationNormalizer';
import HotRemovalNormalizer from './normalizers/HotRemovalNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    lowHealthHealing: LowHealthHealing,
    abilities: Abilities,
    // Normalizer
    castLinkNormalizer: CastLinkNormalizer,
    hotApplicationNormalizer: HotApplicationNormalizer,
    hotRemovalNormalizer: HotRemovalNormalizer,
    // Generic healer things
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,

    manaTracker: ManaTracker,
    //core
    hotTrackerPrevoker: HotTrackerPrevoker,
    hotAttributor: HotAttributor,

    dreamBreath: DreamBreath,
    livingFlame: LivingFlame,
    masteryEffectiveness: MasteryEffectiveness,
    spiritBloom: Spiritbloom,
  };
}

export default CombatLogParser;
