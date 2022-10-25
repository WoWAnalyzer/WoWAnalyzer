import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
import PreparationRuleAnalyzer from 'parser/classic/modules/features/Checklist/PreparationRuleAnalyzer';
import lowRankSpellsSuggestion from 'parser/classic/suggestions/lowRankSpells';

import lowRankSpells, { whitelist } from './lowRankSpells';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CurseOfAgony from './modules/spells/CurseOfAgony';
import CurseOfDoom from './modules/spells/CurseOfDoom';
import CurseOfTheElements from './modules/spells/CurseOfTheElements';
import Curses from './modules/spells/Curses';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    abilities: Abilities,
    abilityTracker: AbilityTracker,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    checklist: Checklist,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    curseOfAgony: CurseOfAgony,
    curseOfDoom: CurseOfDoom,
    curseOfTheElements: CurseOfTheElements,
    curses: Curses,

    lowRankSpells: lowRankSpellsSuggestion(lowRankSpells, whitelist),
  };
}

export default CombatLogParser;
