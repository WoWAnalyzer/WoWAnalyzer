import MainCombatLogParser from 'parser/core/CombatLogParser';
import Haste from './modules/core/Haste';
import GlobalCooldown from './modules/core/GlobalCooldown';

//Normalizers
import LunarEmpowermentNormalizer from './normalizers/LunarEmpowermentNormalizer';
import SolarEmpowermentNormalizer from './normalizers/SolarEmpowermentNormalizer';

//Features
import Checklist from './modules/features/Checklist/Module';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CancelledCasts from './modules/features/CancelledCasts';
import Abilities from './modules/Abilities';
import LunarEmpowerment from './modules/features/LunarEmpowerment';
import SolarEmpowerment from './modules/features/SolarEmpowerment';
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

//azerite
import DawningSun from './modules/talents/azeritetraits/DawningSun';
import HighNoon from './modules/talents/azeritetraits/HighNoon';
import PowerOfTheMoon from './modules/talents/azeritetraits/PowerOfTheMoon';
import StreakingStars from './modules/talents/azeritetraits/StreakingStars';
import ArcanicPulsar from './modules/talents/azeritetraits/ArcanicPulsar';

//Items

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
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

    //azerite
    dawningSun: DawningSun,
    highNoon: HighNoon,
    powerOfTheMoon: PowerOfTheMoon,
    streakingStars: StreakingStars,
    arcanicPulsar: ArcanicPulsar,
  };
}

export default CombatLogParser;
