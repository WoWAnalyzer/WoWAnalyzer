// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import lowRankSpellsSuggestion from 'parser/classic/suggestions/lowRankSpells';
import { lowRankSpells, GlobalCooldown } from 'analysis/classic/deathknight/shared';
// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/checklist/Module';
// Spells

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    lowRankSpells: lowRankSpellsSuggestion(lowRankSpells),
    globalCooldown: GlobalCooldown,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    // Spells
  };
}

export default CombatLogParser;
