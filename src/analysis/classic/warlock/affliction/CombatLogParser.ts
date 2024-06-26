import { Haste, DemonicCirclesCreated } from 'analysis/classic/warlock/shared';

import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
import PreparationRuleAnalyzer from 'parser/classic/modules/features/Checklist/PreparationRuleAnalyzer';
import Channeling from 'parser/shared/normalizers/Channeling';

import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/checklist/Module';
import DotUptimes from './modules/features/DotUptimes';
// Spells
import Corruption from './modules/spells/Corruption';
import CurseOfAgony from './modules/spells/CurseOfAgony';
import DrainSoul from './modules/spells/DrainSoul';
import Haunt from './modules/spells/Haunt';
import UnstableAffliction from './modules/spells/UnstableAffliction';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    abilityTracker: AbilityTracker,
    // Normalizers
    channeling: Channeling,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    demonicCirclesCreated: DemonicCirclesCreated,
    dotUptimes: DotUptimes,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    // Spells
    Corruption: Corruption,
    curseOfAgony: CurseOfAgony,
    unstableAffliction: UnstableAffliction,
    haunt: Haunt,
    drainSoul: DrainSoul,
    // Shared
    haste: Haste,
  };
}

export default CombatLogParser;
