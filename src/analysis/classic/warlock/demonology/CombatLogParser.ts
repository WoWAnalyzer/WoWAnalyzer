// Base files
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
import Guide from './Guide';
// Shared
import { Haste } from '../shared';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
// Modules
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import CancelledCasts from 'parser/shared/modules/CancelledCasts';
// Spells
import Metamorphosis from './modules/spells/Metamorphosis';
import Doomguard from './modules/spells/Doomguard';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
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
    metamorphosis: Metamorphosis,
    doomguard: Doomguard,
  };
  static guide = Guide;
}

export default CombatLogParser;
