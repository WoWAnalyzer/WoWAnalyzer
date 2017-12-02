import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

//Features
import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';

//Items
import SoulOfTheHuntmaster from '../Shared/Modules/Items/SoulOfTheHuntmaster';
import QaplaEredunWarOrder from "./Modules/Items/QaplaEredunWarOrder";
import Tier19_2p from './Modules/Items/Tier19_2p.js';
import Tier20_2p from "./Modules/Items/Tier20_2p";
import Tier20_4p from "./Modules/Items/Tier20_4p";
import Tier21_2p from './Modules/Items/Tier21_2p';
import Tier21_4p from './Modules/Items/Tier21_4p';

//Spells
import DireBeast from "./Modules/Spells/DireBeast/DireBeast";
import BestialWrathAverageFocus from "./Modules/Spells/BestialWrath/BestialWrathAverageFocus";
import BestialWrathUptime from "./Modules/Spells/BestialWrath/BestialWrathUptime";
import GainedBestialWraths from "./Modules/Spells/BestialWrath/GainedBestialWraths";
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
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,

    //Spells
    direBeast: DireBeast,
    direBeastUptime: DireBeastUptime,
    bestialWrathAverageFocus: BestialWrathAverageFocus,
    bestialWrathUptime: BestialWrathUptime,
    gainedBestialWrathst: GainedBestialWraths,

    //Items
    soulOfTheHuntmaster: SoulOfTheHuntmaster,
    qaplaEredunWarOrder: QaplaEredunWarOrder,
    tier19_2p: Tier19_2p,
    tier20_2p: Tier20_2p,
    tier20_4p: Tier20_4p,
    tier21_2p: Tier21_2p,
    tier21_4p: Tier21_4p,

    //Talents
    killerCobra: KillerCobra,

    //Traits
    titansThunder: TitansThunder,

  };
}

export default CombatLogParser;
