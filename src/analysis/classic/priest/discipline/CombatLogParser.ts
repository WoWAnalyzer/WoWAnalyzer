// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import { Haste } from '../shared';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/checklist/Module';
// Healer Features
import HealingEfficiencyDetails from './modules/features/HealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/HealingEfficiencyTracker';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    haste: Haste,
    manaLevelChart: ManaLevelChart,
    manaTracker: ManaTracker,
    manaUsageChart: ManaUsageChart,
    spellManaCost: SpellManaCost,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    // Healer Features
    hpmTracker: HealingEfficiencyTracker,
    hpmDetails: HealingEfficiencyDetails,
  };
}

export default CombatLogParser;
