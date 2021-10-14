import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BaseCombatLogParser from 'parser/tbc/CombatLogParser';
import PreparationRuleAnalyzer from 'parser/tbc/modules/features/Checklist/PreparationRuleAnalyzer';
import lowRankSpellsSuggestion from 'parser/tbc/suggestions/lowRankSpells';

import lowRankSpells, { whitelist } from './lowRankSpells';
import Abilities from './modules/Abilities';
import Checklist from './modules/checklist/Module';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    abilities: Abilities,
    abilityTracker: AbilityTracker,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    checklist: Checklist,
  };

  static suggestions = [
    ...BaseCombatLogParser.suggestions,
    lowRankSpellsSuggestion(lowRankSpells, whitelist),
  ];
}

export default CombatLogParser;
