import MainCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from '../shared/modules/Abilities';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    abilities: Abilities,
  };
}

export default CombatLogParser;
