// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import lowRankSpellsSuggestion from 'parser/classic/suggestions/lowRankSpells';
import { lowRankSpells } from '../shared';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/checklist/Module';
// Spells
// import SpellName from './modules/spells';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    lowRankSpells: lowRankSpellsSuggestion(lowRankSpells),
    manaLevelChart: ManaLevelChart,
    manaTracker: ManaTracker,
    manaUsageChart: ManaUsageChart,
    spellManaCost: SpellManaCost,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    // Spells
    // spellName: SpellName,
  };
}

export default CombatLogParser;
