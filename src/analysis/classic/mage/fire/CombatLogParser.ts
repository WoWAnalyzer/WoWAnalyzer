// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import { Haste, ColdSnap } from 'analysis/classic/mage/shared';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/checklist/Module';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    manaTracker: ManaTracker,
    spellManaCost: SpellManaCost,
    coldSnap: ColdSnap,
    haste: Haste,
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
  };
}

export default CombatLogParser;
