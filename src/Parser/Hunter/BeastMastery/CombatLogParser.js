import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import GlobalCooldown from 'Parser/Hunter/BeastMastery/Modules/Core/GlobalCooldown';

//Features
import Abilities from './Modules/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import FocusUsage from '../Shared/Modules/Features/FocusUsage';
import TimeFocusCapped from '../Shared/Modules/Features/TimeFocusCapped';

//Talents
import NaturalMending from '../Shared/Modules/Talents/NaturalMending';
import Trailblazer from '../Shared/Modules/Talents/Trailblazer';
import Barrage from '../Shared/Modules/Talents/Barrage';
import ChimaeraShot from './Modules/Talents/ChimaeraShot';
import DireBeast from './Modules/Talents/DireBeast';
import KillerCobra from './Modules/Talents/KillerCobra';
import Stampede from './Modules/Talents/Stampede';
import Stomp from './Modules/Talents/Stomp';

//Spells
import BestialWrathAverageFocus from "./Modules/Spells/BestialWrath/BestialWrathAverageFocus";
import BestialWrathUptime from "./Modules/Spells/BestialWrath/BestialWrathUptime";
import GainedBestialWraths from "./Modules/Spells/BestialWrath/GainedBestialWraths";
import BeastCleave from './Modules/Spells/BeastCleave';
import CobraShot from './Modules/Spells/CobraShot';
import BarbedShot from './Modules/Spells/BarbedShot';
import AspectOfTheWild from './Modules/Spells/AspectOfTheWild';

//Focus
import FocusTracker from '../Shared/Modules/Features/FocusChart/FocusTracker';
import FocusTab from '../Shared/Modules/Features/FocusChart/FocusTab';

//Traits and talents
import TraitsAndTalents from './Modules/Features/TraitsAndTalents';

//Azerite Traits
import DanceOfDeath from './Modules/Spells/AzeriteTraits/DanceOfDeath';
import HazeOfRage from './Modules/Spells/AzeriteTraits/HazeOfRage';
import FeedingFrenzy from './Modules/Spells/AzeriteTraits/FeedingFrenzy';
import PrimalInstincts from './Modules/Spells/AzeriteTraits/PrimalInstincts';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    damageDone: [DamageDone, { showStatistic: true }],
    globalCooldown: GlobalCooldown,

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
    bestialWrathAverageFocus: BestialWrathAverageFocus,
    bestialWrathUptime: BestialWrathUptime,
    gainedBestialWraths: GainedBestialWraths,
    beastCleave: BeastCleave,
    cobraShot: CobraShot,
    barbedShot: BarbedShot,
    aspectOfTheWild: AspectOfTheWild,

    //Talents
    chimaeraShot: ChimaeraShot,
    direBeast: DireBeast,
    naturalMending: NaturalMending,
    trailblazer: Trailblazer,
    barrage: Barrage,
    killerCobra: KillerCobra,
    stampede: Stampede,
    stomp: Stomp,

    //Traits and talents
    traitsAndTalents: TraitsAndTalents,

    //Azerite Traits
    danceOfDeath: DanceOfDeath,
    hazeOfRage: HazeOfRage,
    feedingFrenzy: FeedingFrenzy,
    primalInstincts: PrimalInstincts,
  };
}

export default CombatLogParser;
