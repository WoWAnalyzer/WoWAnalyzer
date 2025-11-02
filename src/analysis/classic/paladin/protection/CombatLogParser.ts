// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
// Features
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
// Spells
import HolyShield from './modules/spells/HolyShield';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    // Spells
    holyShield: HolyShield,
  };
}

export default CombatLogParser;
