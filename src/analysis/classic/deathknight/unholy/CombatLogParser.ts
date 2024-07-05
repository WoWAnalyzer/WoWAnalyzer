import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { GlobalCooldown } from 'analysis/classic/deathknight/shared';
import Haste from 'parser/shared/modules/Haste';
// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import PreparationRuleAnalyzer from 'parser/classic/modules/features/Checklist/PreparationRuleAnalyzer';
// Spells
import FoundationGuide from 'interface/guide/foundation/FoundationGuide';
import ArmyOfTheDead from '../shared/ArmyOfTheDead';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    abilityTracker: AbilityTracker,
    globalCooldown: GlobalCooldown,
    haste: Haste,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    // Spells
    ArmyOfTheDead,
  };

  static guide = FoundationGuide;
}

export default CombatLogParser;
