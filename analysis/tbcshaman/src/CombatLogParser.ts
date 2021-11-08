import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import BaseCombatLogParser from 'parser/tbc/CombatLogParser';
import PreparationRuleAnalyzer from 'parser/tbc/modules/features/Checklist/PreparationRuleAnalyzer';
import lowRankSpellsSuggestion from 'parser/tbc/suggestions/lowRankSpells';

import lowRankSpells, { whitelist } from './lowRankSpells';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import HealingEfficiencyDetails from './modules/features/HealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/HealingEfficiencyTracker';
import ChainHeal from './modules/spells/ChainHeal';
import EarthShield from './modules/spells/EarthShield';
import ManaTideTotem from './modules/spells/ManaTideTotem';
import WaterShield from './modules/spells/WaterShield';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    abilities: Abilities,
    buffs: Buffs,
    spellManaCost: SpellManaCost,
    abilityTracker: AbilityTracker,
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    earthShield: EarthShield,
    waterShield: WaterShield,
    chainHeal: ChainHeal,
    manaTideTotem: ManaTideTotem,

    // Mana Tab
    manaTracker: ManaTracker,
    hpmTracker: HealingEfficiencyTracker,
    hpmDetails: HealingEfficiencyDetails,

    checklist: Checklist,
  };

  static suggestions = [
    ...BaseCombatLogParser.suggestions,
    lowRankSpellsSuggestion(lowRankSpells, whitelist),
  ];
}

export default CombatLogParser;
