import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
import PreparationRuleAnalyzer from 'parser/classic/modules/features/Checklist/PreparationRuleAnalyzer';
import lowRankSpellsSuggestion from 'parser/classic/suggestions/lowRankSpells';

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

    lowRankSpells: lowRankSpellsSuggestion(lowRankSpells, whitelist),
  };
}

export default CombatLogParser;
