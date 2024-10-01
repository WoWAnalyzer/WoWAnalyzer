// Base files
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import { Haste } from 'analysis/classic/mage/shared';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
// Core
import GlobalCooldown from './modules/core/GlobalCooldown';
// Modules
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import FoundationGuide from 'interface/guide/foundation/FoundationGuide';
import CancelledCasts from 'parser/shared/modules/CancelledCasts';
// Normalizers
import ArcaneMissilesNormalizer from './normalizers/ArcaneMissiles';
// Spells
// import SpellName from './modules/spells';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    haste: Haste,
    manaTracker: ManaTracker,
    spellManaCost: SpellManaCost,
    // Core
    globalCooldown: GlobalCooldown,
    // Modules
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    // Normalizers
    arcaneMissilesNormalizer: ArcaneMissilesNormalizer,
    // Spells
    // spellName: SpellName,
  };
  static guide = FoundationGuide;
}

export default CombatLogParser;
