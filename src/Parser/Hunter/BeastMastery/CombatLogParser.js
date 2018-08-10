import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import GlobalCooldown from 'Parser/Hunter/BeastMastery/Modules/Core/GlobalCooldown';

//Features
import Abilities from './Modules/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import FocusUsage from '../Shared/Modules/Features/FocusUsage';
import TimeFocusCapped from '../Shared/Modules/Features/TimeFocusCapped';

//Items
import SoulOfTheHuntmaster from '../Shared/Modules/Items/SoulOfTheHuntmaster';
import QaplaEredunWarOrder from "./Modules/Items/QaplaEredunWarOrder";
import Tier19_2p from './Modules/Items/Tier19_2p.js';
import Tier20_2p from "./Modules/Items/Tier20_2p";
import Tier20_4p from "./Modules/Items/Tier20_4p";
import Tier21_2p from './Modules/Items/Tier21_2p';
import Tier21_4p from './Modules/Items/Tier21_4p';
import RootsOfShaladrassil from '../Shared/Modules/Items/RootsOfShaladrassil';
import CallOfTheWild from '../Shared/Modules/Items/CallOfTheWild';
import TheApexPredatorsClaw from '../Shared/Modules/Items/TheApexPredatorsClaw';
import TheShadowHuntersVoodooMask from '../Shared/Modules/Items/TheShadowHuntersVoodooMask';
import ParselsTongue from './Modules/Items/ParselsTongue';
import TheMantleOfCommand from './Modules/Items/TheMantleOfCommand';
import RoarOfTheSevenLions from './Modules/Items/RoarOfTheSevenLions';
import ZevrimsHunger from '../Shared/Modules/Items/ZevrimsHunger';
import CelerityOfTheWindrunners from '../Shared/Modules/Items/CelerityOfTheWindrunners';
import UnseenPredatorsCloak from '../Shared/Modules/Items/UnseenPredatorsCloak';
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

    //Items
    soulOfTheHuntmaster: SoulOfTheHuntmaster,
    qaplaEredunWarOrder: QaplaEredunWarOrder,
    theApexPredatorsClaw: TheApexPredatorsClaw,
    callOfTheWild: CallOfTheWild,
    rootsOfShaladrassil: RootsOfShaladrassil,
    theShadowHuntersVoodooMask: TheShadowHuntersVoodooMask,
    parselsTongue: ParselsTongue,
    theMantleOfCommand: TheMantleOfCommand,
    roarOfTheSevenLions: RoarOfTheSevenLions,
    zevrimsHunger: ZevrimsHunger,
    celerityOfTheWindrunners: CelerityOfTheWindrunners,
    unseenPredatorsCloak: UnseenPredatorsCloak,
    tier19_2p: Tier19_2p,
    tier20_2p: Tier20_2p,
    tier20_4p: Tier20_4p,
    tier21_2p: Tier21_2p,
    tier21_4p: Tier21_4p,

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
  };
}

export default CombatLogParser;
