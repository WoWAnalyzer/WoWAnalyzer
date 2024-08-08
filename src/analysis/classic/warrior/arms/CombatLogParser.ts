// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Shared
// Features
import Abilities from './modules/features/Abilities';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
// Spells
import Overpower from '../shared/Overpower';
import Execute from '../shared/Execute';
import SuddenDeath from './modules/spells/SuddenDeath';
import Guide from './Guide';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    // Features
    abilities: Abilities,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    alwaysBeCasting: AlwaysBeCasting,
    // Spells
    overpower: Overpower,
    execute: Execute,
    suddenDeath: SuddenDeath,
  };

  static guide = Guide;
}

export default CombatLogParser;
