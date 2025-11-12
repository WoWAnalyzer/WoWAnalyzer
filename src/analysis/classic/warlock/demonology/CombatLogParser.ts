// Base files
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
import { Pets, Talents } from '../shared';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
// Modules
import { Abilities } from './gen';
import Buffs from './modules/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import FoundationGuide from 'interface/guide/foundation/FoundationGuide';
import CancelledCasts from 'parser/shared/modules/CancelledCasts';
// Spells
import Metamorphosis from './modules/spells/Metamorphosis';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    pets: Pets,
    talents: Talents,
    manaTracker: ManaTracker,
    spellManaCost: SpellManaCost,
    // Modules
    abilities: Abilities,
    cancelledCasts: CancelledCasts,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    // Spells
    metamorphosis: Metamorphosis,
  };
  static guide = FoundationGuide;
}

export default CombatLogParser;
