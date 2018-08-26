import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import Haste from './Modules/Core/Haste';
import GlobalCooldown from './Modules/Core/GlobalCooldown';

//Normalizers
import LunarEmpowermentNormalizer from './Modules/Normalizers/LunarEmpowermentNormalizer';
import SolarEmpowermentNormalizer from './Modules/Normalizers/SolarEmpowermentNormalizer';

//Features
import Checklist from './Modules/Features/Checklist';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CancelledCasts from './Modules/Features/CancelledCasts';
import Abilities from './Modules/Abilities';
import LunarEmpowerment from './Modules/Features/LunarEmpowerment';
import SolarEmpowerment from './Modules/Features/SolarEmpowerment';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import MoonfireUptime from './Modules/Features/MoonfireUptime';
import SunfireUptime from './Modules/Features/SunfireUptime';
import UnempoweredLunarStrike from './Modules/Features/UnempoweredLunarStrike';
import EarlyDotRefreshes from './Modules/Features/EarlyDotRefreshes';
import EarlyDotRefreshesInstants from './Modules/Features/EarlyDotRefreshesInstants';

//Talents
import StellarFlareUptime from './Modules/Talents/StellarFlareUptime';
import TwinMoons from './Modules/Talents/TwinMoons';
import StellarDrift from './Modules/Talents/StellarDrift';
import Starlord from './Modules/Talents/Starlord';

//Resources
import AstralPowerDetails from './Modules/ResourceTracker/AstralPowerDetails';
import AstralPowerTracker from './Modules/ResourceTracker/AstralPowerTracker';

//Items

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    damageDone: [DamageDone, { showStatistic: true }],
    haste: Haste,
    globalCooldown: GlobalCooldown,

    //Normalizers
    lunarEmpowermentNormalizer: LunarEmpowermentNormalizer,
    solarEmpowermentNormalizer: SolarEmpowermentNormalizer,

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

    //Items
  };
}

export default CombatLogParser;
