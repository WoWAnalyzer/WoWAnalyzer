import MainCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';

import Guide from './Guide';

import SandsOfTime from './modules/abilities/SandsOfTime';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    abilities: Abilities,
    buffs: Buffs,

    // Abilities
    sandsOfTime: SandsOfTime,
  };
  static guide = Guide;
}

export default CombatLogParser;
