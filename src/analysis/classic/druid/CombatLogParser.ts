import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
import lowRankSpellsSuggestion from 'parser/classic/suggestions/lowRankSpells';

import { lowRankSpells } from 'analysis/classic/druid/shared';
import Abilities from './modules/Abilities';
import Checklist from './modules/checklist/Module';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import HealingEfficiencyDetails from './modules/features/HealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/HealingEfficiencyTracker';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    abilities: Abilities,
    spellManaCost: SpellManaCost,
    abilityTracker: AbilityTracker,
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,
    alwaysBeCasting: AlwaysBeCasting,

    // Mana Tab
    manaTracker: ManaTracker,
    hpmTracker: HealingEfficiencyTracker,
    hpmDetails: HealingEfficiencyDetails,

    checklist: Checklist,

    lowRankSpells: lowRankSpellsSuggestion(lowRankSpells),
  };
}

export default CombatLogParser;
