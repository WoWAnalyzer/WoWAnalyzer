import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Haste from './Modules/Core/Haste';

//Features
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import AstralPower from './Modules/Features/AstralPower';
import Abilities from './Modules/Features/Abilities';
import LEmpowerment from './Modules/Features/LunarEmpowerment';
import SEmpowerment from './Modules/Features/SolarEmpowerment';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';

//Spells
import FullMoon from './Modules/Spells/FullMoon';
import HalfMoon from './Modules/Spells/HalfMoon';
import Moonfire from './Modules/Spells/Moonfire';
import NewMoon from './Modules/Spells/NewMoon';
import Sunfire from './Modules/Spells/Sunfire';
import UnempoweredLs from './Modules/Spells/UnempoweredLs';

//Items
import EmeraldDreamcatcher from './Modules/Items/EmeraldDreamcatcher';


class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    haste: Haste,
    damageDone: [DamageDone, { showStatistic: true }],
    // Features
    alwaysBeCasting: AlwaysBeCasting,
    astralpower: AstralPower,
    abilities: Abilities,
    lsempowerment: LEmpowerment,
    swempowerment: SEmpowerment,
    cooldownThroughputTracker: CooldownThroughputTracker,
    //Spells
    fullmoon: FullMoon,
    halfmoon: HalfMoon,
    moonfire: Moonfire,
    newmoon: NewMoon,
    sunfire: Sunfire,
    unempoweredLS: UnempoweredLs,
    //Items
    emeraldDreamcatcher: EmeraldDreamcatcher,
  };
}

export default CombatLogParser;
