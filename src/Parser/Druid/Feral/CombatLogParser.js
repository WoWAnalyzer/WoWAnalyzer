import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';
import RakeUptime from './Modules/Bleeds/RakeUptime';
import RipUptime from './Modules/Bleeds/RipUptime';

import ComboPointTracker from './Modules/ComboPoints/ComboPointTracker';
import ComboPointDetails from './Modules/ComboPoints/ComboPointDetails';

import SavageRoarUptime from './Modules/Talents/SavageRoarUptime';
import MoonfireUptime from './Modules/Talents/MoonfireUptime';
import SavageRoarDmg from './Modules/Talents/SavageRoarDmg';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // FeralCore
    damageDone: [DamageDone, { showStatistic: true }],

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    castEfficiency: CastEfficiency,
    cooldownTracker: CooldownTracker,

    // bleeds
    rakeUptime: RakeUptime,
    ripUptime: RipUptime,

    // talents
    savageRoarUptime: SavageRoarUptime,
    moonfireUptime: MoonfireUptime,
    savageRoarDmg: SavageRoarDmg,

    // resources
    comboPointTracker: ComboPointTracker,
    comboPointDetails: ComboPointDetails,
  };
}

export default CombatLogParser;
