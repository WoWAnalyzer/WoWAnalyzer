import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
import PreparationRuleAnalyzer from 'parser/classic/modules/features/Checklist/PreparationRuleAnalyzer';
import lowRankSpellsSuggestion from 'parser/classic/suggestions/lowRankSpells';

import lowRankSpells from './lowRankSpells';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import HealingEfficiencyDetails from './modules/features/HealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/HealingEfficiencyTracker';
import TotemTracker from './modules/features/TotemTracker';
import ChainHeal from './modules/spells/ChainHeal';
import EarthShield from './modules/spells/shields/EarthShield';
import WaterShield from './modules/spells/shields/WaterShield';
import AirTotems from './modules/spells/totems/AirTotems';
import EarthTotems from './modules/spells/totems/EarthTotems';
import FireTotems from './modules/spells/totems/FireTotems';
import GroundingTotem from './modules/spells/totems/GroundingTotem';
import ManaTideTotem from './modules/spells/totems/ManaTideTotem';
import WaterTotems from './modules/spells/totems/WaterTotems';

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
    groundingTotem: GroundingTotem,

    totemTracker: TotemTracker,
    fireTotems: FireTotems,
    waterTotems: WaterTotems,
    earthTotems: EarthTotems,
    airTotems: AirTotems,

    // Mana Tab
    manaTracker: ManaTracker,
    hpmTracker: HealingEfficiencyTracker,
    hpmDetails: HealingEfficiencyDetails,

    checklist: Checklist,

    lowRankSpells: lowRankSpellsSuggestion(lowRankSpells),
  };
}

export default CombatLogParser;
