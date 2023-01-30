import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Channeling from 'parser/shared/normalizers/Channeling';
import { lowRankSpells, Haste, ColdSnap } from 'analysis/classic/mage/shared';
// Core
import GlobalCooldown from './modules/core/GlobalCooldown';
// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/checklist/Module';
import PreparationRuleAnalyzer from 'parser/classic/modules/features/Checklist/PreparationRuleAnalyzer';
// Spells
import lowRankSpellsSuggestion from 'parser/classic/suggestions/lowRankSpells';
// Normalizers
import ArcaneMissilesNormalizer from './normalizers/ArcaneMissiles';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    abilityTracker: AbilityTracker,
    channeling: Channeling,
    coldSnap: ColdSnap,
    haste: Haste,
    // Core
    globalCooldown: GlobalCooldown,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    // Spells
    lowRankSpells: lowRankSpellsSuggestion(lowRankSpells),
    // Normalizers
    arcaneMissilesNormalizer: ArcaneMissilesNormalizer,
  };
}

export default CombatLogParser;
