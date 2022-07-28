import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Channeling from 'parser/shared/normalizers/Channeling';

import Abilities from './modules/features/Abilities';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    abilities: Abilities,
    channeling: Channeling,
  };
}

export default CombatLogParser;
