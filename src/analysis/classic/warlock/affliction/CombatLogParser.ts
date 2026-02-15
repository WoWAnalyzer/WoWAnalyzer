// Base files
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import { Pets, Talents } from 'analysis/classic/warlock/shared';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
// Modules
import { Abilities } from './gen';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import FoundationGuide from 'interface/guide/foundation/FoundationGuide';
import CancelledCasts from 'parser/shared/modules/CancelledCasts';
// Spells
import DrainSoul from './modules/spells/DrainSoul';
import SoulSwapExhale from './modules/spells/SoulSwapExhale';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    pets: Pets,
    talents: Talents,
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
    SoulSwapExhale: SoulSwapExhale,
  };
  static guide = FoundationGuide;
}

export default CombatLogParser;
