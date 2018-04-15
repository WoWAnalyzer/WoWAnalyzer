import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import Haste from './Modules/Core/Haste';
import GlobalCooldown from './Modules/Core/GlobalCooldown';

//Features
import Checklist from './Modules/Features/Checklist';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CancelledCasts from './Modules/Features/CancelledCasts';
import Abilities from './Modules/Features/Abilities';
import LunarEmpowerment from './Modules/Features/LunarEmpowerment';
import SolarEmpowerment from './Modules/Features/SolarEmpowerment';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import MoonfireUptime from './Modules/Features/MoonfireUptime';
import SunfireUptime from './Modules/Features/SunfireUptime';
import StellarFlareUptime from './Modules/Features/StellarFlareUptime';
import StellarEmpowermentUptime from './Modules/Features/StellarEmpowermentUptime';
import MoonSpells from './Modules/Features/MoonSpells';
import UnempoweredLunarStrike from './Modules/Features/UnempoweredLunarStrike';
import UnempoweredSolarWrath from './Modules/Features/UnempoweredSolarWrath';

//Talents
import L90Talents from './Modules/Talents/L90Talents';
import StellarDriftMissing from './Modules/Talents/StellarDriftMissing';
import StellarDrift from './Modules/Talents/StellarDrift';
import StellarFlare from './Modules/Talents/StellarFlare';
import Starlord from './Modules/Talents/Starlord';

import EarlyDotRefreshes from './Modules/Features/EarlyDotRefreshes';
import EarlyDotRefreshesInstants from './Modules/Features/EarlyDotRefreshesInstants';

//Resources
import AstralPowerDetails from './Modules/ResourceTracker/AstralPowerDetails';
import AstralPowerTracker from './Modules/ResourceTracker/AstralPowerTracker';

//Items

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    haste: Haste,
    globalCooldown: GlobalCooldown,
    damageDone: [DamageDone, { showStatistic: true }],

    //Features
    checklist: Checklist,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    abilities: Abilities,
    lunarEmpowerment: LunarEmpowerment,
    solarEmpowerment: SolarEmpowerment,
    cooldownThroughputTracker: CooldownThroughputTracker,
    moonfireUptime: MoonfireUptime,
    sunfireUptime: SunfireUptime,
    stellarFlareUptime: StellarFlareUptime,
    stellarEmpowermentUptime: StellarEmpowermentUptime,
    moonSpells: MoonSpells,
    unempoweredLunarStrike: UnempoweredLunarStrike,
    unempoweredSolarWrath: UnempoweredSolarWrath,

    //Talents
    l90Talents: L90Talents,
    stellarDriftMissing: StellarDriftMissing,
    stellarDrift: StellarDrift,
    stellarFlare: StellarFlare,
    starlord: Starlord,

    earlyDotRefreshes: EarlyDotRefreshes,
    earlyDotRefreshesInstants: EarlyDotRefreshesInstants,

    //Resources
    astralPowerTracker: AstralPowerTracker,
    astralPowerDetails: AstralPowerDetails,

    //Items
  };
}

export default CombatLogParser;
