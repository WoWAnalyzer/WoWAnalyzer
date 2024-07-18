// Base files
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import { Haste, DemonicCirclesCreated } from 'analysis/classic/warlock/shared';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
// Modules
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import FoundationGuide from 'interface/guide/foundation/FoundationGuide';
import CancelledCasts from 'parser/shared/modules/CancelledCasts';

// Spells
import DrainSoul from './modules/spells/DrainSoul';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    haste: Haste,
    demonicCirclesCreated: DemonicCirclesCreated,
    // sharedModule: SharedModule,
    manaTracker: ManaTracker,
    spellManaCost: SpellManaCost,
    // Modules
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    // Spells
    drainSoul: DrainSoul,
  };
  static guide = FoundationGuide;
}

export default CombatLogParser;
