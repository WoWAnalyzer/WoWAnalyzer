import MainCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';

import Guide from './Guide';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    abilities: Abilities,
    buffs: Buffs,
  };
  static guide = Guide;
}

export default CombatLogParser;
