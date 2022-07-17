import MainCombatLogParser from 'parser/core/CombatLogParser';
import Channeling from 'parser/shared/normalizers/Channeling';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    channeling: Channeling,
  };
}

export default CombatLogParser;
