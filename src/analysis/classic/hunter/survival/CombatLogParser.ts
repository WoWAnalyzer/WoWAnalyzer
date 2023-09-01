// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';

import Haste from './modules/features/Haste';

// Shared
import { suggestion } from 'parser/core/Analyzer';
import lowRankSpellsSuggestion from 'parser/classic/suggestions/lowRankSpells';
import lowRankSpellsPetSuggestion from './suggestions/lowRankSpellsPet';
import { lowRankSpells, whitelist } from 'analysis/classic/hunter/shared';
import lowRankSpellsPet from '../shared/lowRankSpellsPet';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';

// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/checklist/Module';
import DotUptimes from './modules/features/DotUptimes';

// Spells
import SerpentSting from './modules/spells/SerpentSting';
import KillShot from '../shared/KillShot';
import KillCommandNormalizer from '../shared/normalizers/KillCommandNormalizer';
import GoForTheThroat from '../shared/statistics/GoForTheThroat';
import growl from './suggestions/growl';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    haste: Haste,
    // Shared
    lowRankSpells: lowRankSpellsSuggestion(lowRankSpells, whitelist),
    lowRankPetSpells: lowRankSpellsPetSuggestion(lowRankSpellsPet),
    manaTracker: ManaTracker,
    spellManaCost: SpellManaCost,
    manaLevelChart: ManaLevelChart,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    dotUptimes: DotUptimes,
    // Spells
    serpentSting: SerpentSting,
    killShot: KillShot,
    killCommandNormalizer: KillCommandNormalizer,
    goForTheThroat: GoForTheThroat,
    growl: suggestion(growl()),
  };
}

export default CombatLogParser;
