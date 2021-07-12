import BaseCombatLogParser from 'parser/tbc/CombatLogParser';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Haste from './modules/Haste';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    abilities: Abilities,
    buffs: Buffs,
    haste: Haste,
  };

  static suggestions = [...BaseCombatLogParser.suggestions];
}

export default CombatLogParser;
