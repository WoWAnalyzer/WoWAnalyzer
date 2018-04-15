import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import GlobalCooldown from './Modules/Core/GlobalCooldown';
import SpellUsable from '../Shared/Modules/Core/SpellUsable';
//Features
import Abilities from './Modules/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import FocusUsage from '../Shared/Modules/Features/FocusUsage';
import TimeFocusCapped from '../Shared/Modules/Features/TimeFocusCapped';
//Spells
import DireBeast from './Modules/Spells/DireBeast/DireBeast';
import BestialWrathAverageFocus from './Modules/Spells/BestialWrath/BestialWrathAverageFocus';
import BestialWrathUptime from './Modules/Spells/BestialWrath/BestialWrathUptime';
import GainedBestialWraths from './Modules/Spells/BestialWrath/GainedBestialWraths';
import DireBeastUptime from './Modules/Spells/DireBeast/DireBeastUptime';
import BeastCleave from './Modules/Spells/BeastCleave';
import AspectOfTheWild from './Modules/Spells/AspectOfTheWild';
//Talents
import KillerCobra from './Modules/Talents/KillerCobra';
import AMurderOfCrows from './Modules/Talents/AMurderOfCrows';
import BestialFury from './Modules/Talents/BestialFury';
import Stomp from './Modules/Talents/Stomp';
import AspectOfTheBeast from '../Shared/Modules/Talents/AspectOfTheBeast';
import ChimaeraShot from './Modules/Talents/ChimaeraShot';
import Barrage from '../Shared/Modules/Talents/Barrage';
import Volley from '../Shared/Modules/Talents/Volley';
import WayOfTheCobra from './Modules/Talents/WayOfTheCobra';
import BlinkStrikes from './Modules/Talents/BlinkStrikes';
import DireFrenzy from './Modules/Talents/DireFrenzy';
import Stampede from './Modules/Talents/Stampede';
import DireStable from './Modules/Talents/DireStable';
//Traits
import TitansThunder from './Modules/Traits/TitansThunder';
import CobraCommander from './Modules/Traits/CobraCommander';
import SurgeOfTheStormgod from './Modules/Traits/SurgeOfTheStormgod';
import Thunderslash from './Modules/Traits/Thunderslash';
//Traits and Talents list
import TraitsAndTalents from './Modules/Features/TraitsAndTalents';
//Checklist
import Checklist from './Modules/Features/Checklist';
//Focus
import FocusTracker from '../Shared/Modules/Features/FocusChart/FocusTracker';
import FocusTab from '../Shared/Modules/Features/FocusChart/FocusTab';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    damageDone: [DamageDone, { showStatistic: true }],
    globalCooldown: GlobalCooldown,
    spellUsable: SpellUsable,

    //Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    focusUsage: FocusUsage,
    timeFocusCapped: TimeFocusCapped,

    //Focus Chart
    focusTracker: FocusTracker,
    focusTab: FocusTab,

    //Spells
    direBeast: DireBeast,
    direBeastUptime: DireBeastUptime,
    bestialWrathAverageFocus: BestialWrathAverageFocus,
    bestialWrathUptime: BestialWrathUptime,
    gainedBestialWrathst: GainedBestialWraths,
    beastCleave: BeastCleave,
    aspectOfTheWild: AspectOfTheWild,

    //Talents
    killerCobra: KillerCobra,
    aMurderOfCrows: AMurderOfCrows,
    bestialFury: BestialFury,
    stomp: Stomp,
    aspectOfTheBeast: AspectOfTheBeast,
    barrage: Barrage,
    volley: Volley,
    chimaeraShot: ChimaeraShot,
    wayOfTheCobra: WayOfTheCobra,
    blinkStrikes: BlinkStrikes,
    direFrenzy: DireFrenzy,
    stampede: Stampede,
    direStable: DireStable,

    //Traits
    titansThunder: TitansThunder,
    cobraCommander: CobraCommander,
    surgeOfTheStormgod: SurgeOfTheStormgod,
    thunderslash: Thunderslash,

    //Traits and Talents list
    traitsAndTalents: TraitsAndTalents,

    //Checklist
    checklist: Checklist,
  };
}

export default CombatLogParser;
