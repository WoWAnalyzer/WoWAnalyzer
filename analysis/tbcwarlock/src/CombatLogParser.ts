import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BaseCombatLogParser from 'parser/tbc/CombatLogParser';
import PreparationRuleAnalyzer from 'parser/tbc/modules/features/Checklist/PreparationRuleAnalyzer';
import lowRankSpellsSuggestion from 'parser/tbc/suggestions/lowRankSpells';

import lowRankSpells, { whitelist } from './lowRankSpells';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    abilities: Abilities,
    abilityTracker: AbilityTracker,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    checklist: Checklist,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
  };

  static suggestions = [
    ...BaseCombatLogParser.suggestions,
    lowRankSpellsSuggestion(lowRankSpells, whitelist),
  ];
  static statistics = [...BaseCombatLogParser.statistics];
}

export default CombatLogParser;
