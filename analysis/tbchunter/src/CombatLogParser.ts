import BaseCombatLogParser from 'parser/tbc/CombatLogParser';

import Abilities from './modules/Abilities';
import AutoShotCooldown from './modules/AutoShotCooldown';
import Buffs from './modules/Buffs';
import Haste from './modules/Haste';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    abilities: Abilities,
    buffs: Buffs,
    autoShotCooldown: AutoShotCooldown,
    haste: Haste,
  };

  static suggestions = [...BaseCombatLogParser.suggestions];
}

export default CombatLogParser;
