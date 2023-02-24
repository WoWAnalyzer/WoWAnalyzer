// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import { suggestion } from 'parser/core/Analyzer';
import lowRankSpellsSuggestion from 'parser/classic/suggestions/lowRankSpells';
import lowRankSpellsPetSuggestion from './suggestions/lowRankSpellsPet';

import lowRankSpells from './lowRankSpells';
import lowRankSpellsPet from './lowRankSpellsPet';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/checklist/Module';
// Spells
import KillCommandNormalizer from './normalizers/KillCommandNormalizer';
import GoForTheThroat from './statistics/GoForTheThroat';
import growl from './suggestions/growl';

// import SpellName from './modules/spells';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    lowRankSpells: lowRankSpellsSuggestion(lowRankSpells),
    lowRankPetSpells: lowRankSpellsPetSuggestion(lowRankSpellsPet),
    manaTracker: ManaTracker,
    spellManaCost: SpellManaCost,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    // Spells
    // spellName: SpellName,
    killCommandNormalizer: KillCommandNormalizer,
    goForTheThroat: GoForTheThroat,
    growl: suggestion(growl()),
  };
}

export default CombatLogParser;
