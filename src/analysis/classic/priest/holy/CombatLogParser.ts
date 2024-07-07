// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
// Healer Features
import HealingEfficiencyDetails from './modules/features/HealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/HealingEfficiencyTracker';
import CancelledCasts from 'parser/shared/modules/CancelledCasts';
import FoundationGuide from 'interface/guide/foundation/FoundationGuide';
// Spells
import Chakra, {
  HolyWordChastise,
  HolyWordSanctuary,
  HolyWordSerenity,
} from './modules/spells/Chakra';
import ChakraNormalizer from './modules/normalizers/ChakraNormalizer';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    manaLevelChart: ManaLevelChart,
    manaTracker: ManaTracker,
    manaUsageChart: ManaUsageChart,
    spellManaCost: SpellManaCost,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    // Healer Features
    hpmTracker: HealingEfficiencyTracker,
    hpmDetails: HealingEfficiencyDetails,
    // Spells
    chakra: Chakra,
    hwSanctuary: HolyWordSanctuary,
    hwSerenity: HolyWordSerenity,
    hwChastise: HolyWordChastise,

    // Normalizers
    chakraNormalizer: ChakraNormalizer,
  };

  static guide = FoundationGuide;
}

export default CombatLogParser;
