// Base files
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Core
import GlobalCooldown from './modules/core/GlobalCooldown';
// Shared
import { Haste } from '../shared';
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
import Shadowfiend from './modules/spells/Shadowfiend';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Core
    globalCooldown: GlobalCooldown,
    // Shared
    haste: Haste,
    manaTracker: ManaTracker,
    spellManaCost: SpellManaCost,
    // Modules
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    // Spells
    shadowfiend: Shadowfiend,
  };
  static guide = FoundationGuide;
}

export default CombatLogParser;
