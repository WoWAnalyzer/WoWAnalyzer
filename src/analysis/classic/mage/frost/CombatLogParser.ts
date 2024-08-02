// Base files
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
//import { SharedModule } from '../shared';
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
import ColdSnap from './modules/spells/ColdSnap';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
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
    coldSnap: ColdSnap,
  };
  static guide = FoundationGuide;
}

export default CombatLogParser;
