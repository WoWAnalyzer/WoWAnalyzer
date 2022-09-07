import MainCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from '../shared/modules/features/Abilities';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    abilities: Abilities,
  };
}

export default CombatLogParser;
