import MainCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from '../shared/modules/Abilities';

import LivingFlame from '../shared/modules/core/LivingFlame';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    abilities: Abilities,

    livingFlame: LivingFlame,
  };
}

export default CombatLogParser;
