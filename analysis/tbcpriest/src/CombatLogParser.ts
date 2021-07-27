import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import BaseCombatLogParser from 'parser/tbc/CombatLogParser';
import lowRankSpellsSuggestion from 'parser/tbc/suggestions/lowRankSpells';

import lowRankSpells from './lowRankSpells';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import HealingEfficiencyDetails from './modules/features/HealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/HealingEfficiencyTracker';
import Haste from './modules/Haste';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    spellManaCost: SpellManaCost,
    abilityTracker: AbilityTracker,
    buffs: Buffs,
    haste: Haste,
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,
    checklist: Checklist,

    // Mana Tab
    manaTracker: ManaTracker,
    hpmTracker: HealingEfficiencyTracker,
    hpmDetails: HealingEfficiencyDetails,
  };

  static suggestions = [...BaseCombatLogParser.suggestions, lowRankSpellsSuggestion(lowRankSpells)];
}

export default CombatLogParser;
