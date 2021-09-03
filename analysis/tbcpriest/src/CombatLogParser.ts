import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import BaseCombatLogParser from 'parser/tbc/CombatLogParser';
import lowRankSpellsSuggestion from 'parser/tbc/suggestions/lowRankSpells';

import lowRankSpells from './lowRankSpells';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import HealingEfficiencyDetails from './modules/features/HealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/HealingEfficiencyTracker';
import Haste from './modules/Haste';
import PrayerOfMending from './modules/spells/PrayerOfMending';
import Shadowfiend from './modules/spells/Shadowfiend';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    abilities: Abilities,
    spellManaCost: SpellManaCost,
    abilityTracker: AbilityTracker,
    buffs: Buffs,
    haste: Haste,
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,
    alwaysBeCasting: AlwaysBeCasting,
    // Mana Tab
    manaTracker: ManaTracker,
    hpmTracker: HealingEfficiencyTracker,
    hpmDetails: HealingEfficiencyDetails,

    // Specific Spells
    shadowfiend: Shadowfiend,
    prayerOfMending: PrayerOfMending,

    checklist: Checklist,
  };

  static suggestions = [...BaseCombatLogParser.suggestions, lowRankSpellsSuggestion(lowRankSpells)];
}

export default CombatLogParser;
