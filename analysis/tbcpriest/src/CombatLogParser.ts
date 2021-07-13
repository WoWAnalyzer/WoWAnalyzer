import BaseCombatLogParser from 'parser/tbc/CombatLogParser';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Haste from './modules/Haste';
import Checklist from './modules/checklist/Module';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    abilities: Abilities,
    buffs: Buffs,
    haste: Haste,

    checklist: Checklist,
  };

  static suggestions = [...BaseCombatLogParser.suggestions];
}

export default CombatLogParser;
