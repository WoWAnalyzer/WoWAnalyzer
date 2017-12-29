import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import Haste from './Modules/Core/Haste';

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

//Spells
import FullMoon from './Modules/Spells/FullMoon';
import HalfMoon from './Modules/Spells/HalfMoon';
import NewMoon from './Modules/Spells/NewMoon';
import UnempoweredLs from './Modules/Spells/UnempoweredLs';

//Items
import EmeraldDreamcatcher from './Modules/Items/EmeraldDreamcatcher';


class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    haste: Haste,
    damageDone: [DamageDone, { showStatistic: true }],
    // Features
    checklist: Checklist,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    astralpower: AstralPower,
    abilities: Abilities,
    lunarempowerment: LunarEmpowerment,
    solarempowerment: SolarEmpowerment,
    cooldownThroughputTracker: CooldownThroughputTracker,
    moonfireUptime: MoonfireUptime,
    sunfireUptime: SunfireUptime,
    stellarFlareUptime: StellarFlareUptime,
    moonSpells: MoonSpells,
    //Spells
    fullMoon: FullMoon,
    halfMoon: HalfMoon,
    newMoon: NewMoon,
    unempoweredLS: UnempoweredLs,
    //Items
    emeraldDreamcatcher: EmeraldDreamcatcher,
  };
}

export default CombatLogParser;
