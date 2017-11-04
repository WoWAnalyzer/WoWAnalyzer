import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

//Features
import CastEfficiency from './Modules/Features/CastEfficiency';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import MarkOfTheClaw from "./Modules/Features/MarkOfTheClaw";

//Items
import SoulOfTheHuntmaster from '../Shared/Items/SoulOfTheHuntmaster';
import QaplaEredunWarOrder from "./Modules/Items/QaplaEredunWarOrder";

//Spells
import DireBeast from "./Modules/Spells/DireBeast/DireBeast";
import BestialWrath from "./Modules/Spells/BestialWrath/BestialWrath";
import BestialWrathUptime from "./Modules/Spells/BestialWrath/BestialWrathUptime";
import DireBeastUptime from "./Modules/Spells/DireBeast/DireBeastUptime";

//Talents
import KillerCobra from "./Modules/Talents/KillerCobra";

//Traits
import TitansThunder from "./Modules/Traits/TitansThunder";

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    damageDone: [DamageDone, { showStatistic: true }],

    //Features
    alwaysBeCasting: AlwaysBeCasting,
    castEfficiency: CastEfficiency,
    cooldownThroughputTracker: CooldownThroughputTracker,
    markOfTheClaw: MarkOfTheClaw,

    //Spells
    direBeast: DireBeast,
    direBeastUptime: DireBeastUptime,
    bestialWrath: BestialWrath,
    bestialWrathUptime: BestialWrathUptime,

    //Items
    soulOfTheHuntmaster: SoulOfTheHuntmaster,
    qaplaEredunWarOrder: QaplaEredunWarOrder,

    //Talents
    killerCobra: KillerCobra,

    //Traits
    titansThunder: TitansThunder,
  };
}

export default CombatLogParser;
