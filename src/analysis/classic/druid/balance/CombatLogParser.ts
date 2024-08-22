// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import FillerUsage from './modules/features/FillerUsage';
import Checklist from './modules/checklist/Module';
// Spells

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    manaTracker: ManaTracker,
    spellManaCost: SpellManaCost,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    // Spells
    fillerUSage: FillerUsage,
  };
}

export default CombatLogParser;
