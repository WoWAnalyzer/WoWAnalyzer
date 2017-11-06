import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import DamageTaken from 'Parser/Core/Modules/DamageTaken';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import NotImplementedYet from './Modules/NotImplementedYet';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    healingDone: [HealingDone, { showStatistic: true }],
    damageTaken: [DamageTaken, { showStatistic: true }],
    damageDone: [DamageDone, { showStatistic: true }],

    notImplementedYet: NotImplementedYet,
  };
}

export default CombatLogParser;
