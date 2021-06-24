import CoreCombatLogParser from 'parser/tbc/CombatLogParser';

import Abilities from './modules/Abilities';
import AutoShotCooldown from './modules/AutoShotCooldown';
import Buffs from './modules/Buffs';
import Haste from './modules/Haste';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    abilities: Abilities,
    buffs: Buffs,
    autoShotCooldown: AutoShotCooldown,
    haste: Haste,
  };
}

export default CombatLogParser;
