// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import { Haste } from '../shared';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
// Features
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
// Healer Features
import HealingEfficiencyDetails from './modules/features/HealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/HealingEfficiencyTracker';
import CancelledCasts from 'parser/shared/modules/CancelledCasts';
import FoundationGuide from 'interface/guide/foundation/FoundationGuide';
// Normalizers
import PenanceNormalizer from './modules/normalizers/Penance';
// Spells
// import SpellName from './modules/spells';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    haste: Haste,
    manaLevelChart: ManaLevelChart,
    manaTracker: ManaTracker,
    manaUsageChart: ManaUsageChart,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    // Healer Features
    hpmTracker: HealingEfficiencyTracker,
    hpmDetails: HealingEfficiencyDetails,
    // Normalizers
    penanceNormalizer: PenanceNormalizer,
    // Spells
    // spellName: SpellName,
  };

  static guide = FoundationGuide;
}

export default CombatLogParser;
