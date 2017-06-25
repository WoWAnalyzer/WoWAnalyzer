import MainCombatLogParser from 'Parser/Core/CombatLogParser';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

class CombatLogParser extends MainCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
  };

  generateResults() {
    const results = super.generateResults();

    return results;
  }
}

export default CombatLogParser;
