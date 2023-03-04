import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import {
  lowRankSpells,
  whitelist,
  DemonicCirclesCreated,
  GlobalCooldown,
  Spellstone,
} from 'analysis/classic/warlock/shared';
// Normalizers
import Channeling from 'parser/shared/normalizers/Channeling';
// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/checklist/Module';
import CurseUptime from './modules/features/CurseUptime';
import DotUptimes from './modules/features/DotUptimes';
import PreparationRuleAnalyzer from 'parser/classic/modules/features/Checklist/PreparationRuleAnalyzer';
// Spells
import lowRankSpellsSuggestion from 'parser/classic/suggestions/lowRankSpells';
import Corruption from './modules/spells/Corruption';
import CurseOfAgony from './modules/spells/CurseOfAgony';
import CurseOfDoom from './modules/spells/CurseOfDoom';
import CurseOfTheElements from './modules/spells/CurseOfTheElements';
import Immolate from './modules/spells/Immolate';
import ShadowMastery from './modules/spells/ShadowMastery';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    abilityTracker: AbilityTracker,
    demonicCirclesCreated: DemonicCirclesCreated,
    globalCooldown: GlobalCooldown,
    spellstone: Spellstone,
    // Normalizers
    channeling: Channeling,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    curseUptime: CurseUptime,
    dotUptimes: DotUptimes,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    // Spells
    lowRankSpells: lowRankSpellsSuggestion(lowRankSpells, whitelist),
    Corruption: Corruption,
    curseOfAgony: CurseOfAgony,
    curseOfDoom: CurseOfDoom,
    curseOfTheElements: CurseOfTheElements,
    immolate: Immolate,
    shadowMastery: ShadowMastery,
  };
}

export default CombatLogParser;
