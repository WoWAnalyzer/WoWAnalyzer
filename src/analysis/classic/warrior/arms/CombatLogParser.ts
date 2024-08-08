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
import FoundationGuide from 'interface/guide/foundation/FoundationGuide';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Shared
    // Features
    abilities: Abilities,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    // Spells
    overpower: Overpower,
    execute: Execute,
    suddenDeath: SuddenDeath,
  };

  static guide = FoundationGuide;
}

export default CombatLogParser;
