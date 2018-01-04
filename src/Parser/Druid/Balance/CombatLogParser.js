import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import Haste from './Modules/Core/Haste';
import GlobalCooldown from './Modules/Core/GlobalCooldown';

//Features
import Checklist from './Modules/Features/Checklist';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CancelledCasts from './Modules/Features/CancelledCasts';
import AstralPower from './Modules/Features/AstralPower';
import Abilities from './Modules/Features/Abilities';
import LunarEmpowerment from './Modules/Features/LunarEmpowerment';
import SolarEmpowerment from './Modules/Features/SolarEmpowerment';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import MoonfireUptime from './Modules/Features/MoonfireUptime';
import SunfireUptime from './Modules/Features/SunfireUptime';
import StellarFlareUptime from './Modules/Features/StellarFlareUptime';
import MoonSpells from './Modules/Features/MoonSpells';
import UnempoweredLs from './Modules/Features/UnempoweredLs';

//Resources
import AstralPowerDetails from './Modules/ResourceTracker/AstralPowerDetails';
import AstralPowerTracker from './Modules/ResourceTracker/AstralPowerTracker';

//Items
import TheEmeraldDreamcatcher from './Modules/Items/TheEmeraldDreamcatcher';
import ImpeccableFelEssence from './Modules/Items/ImpeccableFelEssence';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    haste: Haste,
    globalCooldown: GlobalCooldown,
    damageDone: [DamageDone, { showStatistic: true }],

    //Features
    checklist: Checklist,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    astralPower: AstralPower,
    abilities: Abilities,
    lunarEmpowerment: LunarEmpowerment,
    solarEmpowerment: SolarEmpowerment,
    cooldownThroughputTracker: CooldownThroughputTracker,
    moonfireUptime: MoonfireUptime,
    sunfireUptime: SunfireUptime,
    stellarFlareUptime: StellarFlareUptime,
    moonSpells: MoonSpells,
    unempoweredLS: UnempoweredLs,

    //Resources
    astralPowerTracker: AstralPowerTracker,
    astralPowerDetails: AstralPowerDetails,

    //Items
    theEmeraldDreamcatcher: TheEmeraldDreamcatcher,
    impeccableFelEssence : ImpeccableFelEssence,
  };
}

export default CombatLogParser;
