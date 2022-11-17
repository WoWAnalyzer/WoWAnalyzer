import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Core
import GlobalCooldown from './modules/core/GlobalCooldown';
// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/checklist/Module';
import Haste from 'parser/shared/modules/Haste';
import PreparationRuleAnalyzer from 'parser/classic/modules/features/Checklist/PreparationRuleAnalyzer';
// Spells
import { lowRankSpells } from 'analysis/classic/deathknight/shared';
import lowRankSpellsSuggestion from 'parser/classic/suggestions/lowRankSpells';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    abilityTracker: AbilityTracker,
    // Core
    globalCooldown: GlobalCooldown,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    haste: Haste,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    // Spells
    lowRankSpells: lowRankSpellsSuggestion(lowRankSpells),
  };
}

export default CombatLogParser;
