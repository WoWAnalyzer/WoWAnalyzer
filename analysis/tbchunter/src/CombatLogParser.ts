import CoreCombatLogParser from 'parser/tbc/CombatLogParser';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    abilities: Abilities,
    buffs: Buffs,
  };
}

export default CombatLogParser;
