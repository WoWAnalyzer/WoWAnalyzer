import MainCombatLogParser from 'parser/core/CombatLogParser';

import GlobalCooldown from './modules/core/GlobalCooldown';

//Features
import Checklist from './modules/features/Checklist/Module';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CancelledCasts from './modules/features/CancelledCasts';
import Abilities from './modules/Abilities';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import MoonfireUptime from './modules/features/MoonfireUptime';
import SunfireUptime from './modules/features/SunfireUptime';
import UnempoweredLunarStrike from './modules/features/UnempoweredLunarStrike';
import EarlyDotRefreshes from './modules/features/EarlyDotRefreshes';
import EarlyDotRefreshesInstants from './modules/features/EarlyDotRefreshesInstants';

//Talents
import StellarFlareUptime from './modules/talents/StellarFlareUptime';
import TwinMoons from './modules/talents/TwinMoons';
import StellarDrift from './modules/talents/StellarDrift';
import Starlord from './modules/talents/Starlord';

//Resources
import AstralPowerDetails from './modules/resourcetracker/AstralPowerDetails';
import AstralPowerTracker from './modules/resourcetracker/AstralPowerTracker';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    globalCooldown: GlobalCooldown,

    //Features
    checklist: Checklist,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    moonfireUptime: MoonfireUptime,
    sunfireUptime: SunfireUptime,
    unempoweredLunarStrike: UnempoweredLunarStrike,
    earlyDotRefreshes: EarlyDotRefreshes,
    earlyDotRefreshesInstants: EarlyDotRefreshesInstants,

    //Talents
    stellarFlareUptime: StellarFlareUptime,
    twinMoons: TwinMoons,
    stellarDrift: StellarDrift,
    starlord: Starlord,

    //Resources
    astralPowerTracker: AstralPowerTracker,
    astralPowerDetails: AstralPowerDetails,
  };
}

export default CombatLogParser;
