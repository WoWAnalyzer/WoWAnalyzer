import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import Channeling from './Modules/Features/Channeling';
import Abilities from './Modules/Abilities';

//Features
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import TimeFocusCapped from '../Shared/Modules/Features/TimeFocusCapped';
import CancelledCasts from "../Shared/Modules/Features/CancelledCasts";
import FocusUsage from '../Shared/Modules/Features/FocusUsage';
//Normalizers
import RapidFireNormalizer from './Modules/Normalizers/RapidFire';

//Tier
import Tier19_2p from "./Modules/Items/Tier19_2p";
import Tier20_2p from './Modules/Items/Tier20_2p';
import Tier20_4p from './Modules/Items/Tier20_4p';
import Tier21_2p from './Modules/Items/Tier21_2p';
import Tier21_4p from './Modules/Items/Tier21_4p';

//Spells
import Trueshot from './Modules/Spells/Trueshot';
import LoneWolf from './Modules/Spells/LoneWolf';
//Talents
import AMurderOfCrows from '../Shared/Modules/Talents/AMurderOfCrows';
import Barrage from '../Shared/Modules/Talents/Barrage';
import Volley from './Modules/Talents/Volley';
import ExplosiveShot from './Modules/Talents/ExplosiveShot';
import LockAndLoad from './Modules/Talents/LockAndLoad';
import PiercingShot from './Modules/Talents/PiercingShot';
import MasterMarksman from './Modules/Talents/MasterMarksman';
import LethalShots from './Modules/Talents/LethalShots';
import DoubleTap from './Modules/Talents/DoubleTap';
import CallingTheShots from './Modules/Talents/CallingTheShots';
import HuntersMark from './Modules/Talents/HuntersMark';
import SerpentSting from './Modules/Talents/SerpentSting';
import NaturalMending from '../Shared/Modules/Talents/NaturalMending';
import Trailblazer from '../Shared/Modules/Talents/Trailblazer';
import CarefulAim from './Modules/Talents/CarefulAim';

//Focus
import FocusTracker from '../Shared/Modules/Features/FocusChart/FocusTracker';
import FocusTab from '../Shared/Modules/Features/FocusChart/FocusTab';
//Items
import UllrsFeatherSnowshoes from './Modules/Items/UllrsFeatherSnowshoes';
import SoulOfTheHuntmaster from '../Shared/Modules/Items/SoulOfTheHuntmaster';
import MKIIGyroscopicStabilizer from './Modules/Items/MKIIGyroscopicStabilizer';
import WarBeltOfTheSentinelArmy from "./Modules/Items/WarBeltOfTheSentinelArmy";
import TarnishedSentinelMedallion from "./Modules/Items/TarnishedSentinelMedallion";
import CelerityOfTheWindrunners from '../Shared/Modules/Items/CelerityOfTheWindrunners';
import MagnetizedBlastingCapLauncher from './Modules/Items/MagnetizedBlastingCapLauncher';
import RootsOfShaladrassil from '../Shared/Modules/Items/RootsOfShaladrassil';
import CallOfTheWild from '../Shared/Modules/Items/CallOfTheWild';
import TheApexPredatorsClaw from '../Shared/Modules/Items/TheApexPredatorsClaw';
import TheShadowHuntersVoodooMask from '../Shared/Modules/Items/TheShadowHuntersVoodooMask';
import ZevrimsHunger from '../Shared/Modules/Items/ZevrimsHunger';
import UnseenPredatorsCloak from '../Shared/Modules/Items/UnseenPredatorsCloak';

//Traits and Talents
import TraitsAndTalents from './Modules/Features/TraitsAndTalents';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core statistics
    damageDone: [DamageDone, { showStatistic: true }],
    abilities: Abilities,
    channeling: Channeling,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    timeFocusCapped: TimeFocusCapped,
    cancelledCasts: CancelledCasts,
    focusUsage: FocusUsage,

    //Normalizers
    rapidFireNormalizer: RapidFireNormalizer,

    //Focus Chart
    focusTracker: FocusTracker,
    focusTab: FocusTab,

    //Items
    tier19_2p: Tier19_2p,
    tier20_2p: Tier20_2p,
    tier20_4p: Tier20_4p,
    tier21_2p: Tier21_2p,
    tier21_4p: Tier21_4p,
    ullrsFeatherSnowshoes: UllrsFeatherSnowshoes,
    soulOfTheHuntmaster: SoulOfTheHuntmaster,
    mkiiGyroscopicStabilizer: MKIIGyroscopicStabilizer,
    warBeltOfTheSentinelArmy: WarBeltOfTheSentinelArmy,
    celerityOfTheWindrunners: CelerityOfTheWindrunners,
    magnetizedBlastingCapLauncher: MagnetizedBlastingCapLauncher,
    zevrimsHunger: ZevrimsHunger,
    callOfTheWild: CallOfTheWild,
    rootsOfShaladrassil: RootsOfShaladrassil,
    theApexPredatorsClaw: TheApexPredatorsClaw,
    theShadowHuntersVoodooMask: TheShadowHuntersVoodooMask,
    tarnishedSentinelMedallion: TarnishedSentinelMedallion,
    unseenPredatorsCloak: UnseenPredatorsCloak,

    //Spells
    trueshot: Trueshot,
    loneWolf: LoneWolf,

    //Talents
    volley: Volley,
    explosiveShot: ExplosiveShot,
    aMurderOfCrows: AMurderOfCrows,
    lockAndLoad: LockAndLoad,
    piercingShot: PiercingShot,
    barrage: Barrage,
    masterMarksman: MasterMarksman,
    lethalShots: LethalShots,
    doubleTap: DoubleTap,
    callingTheShots: CallingTheShots,
    huntersMark: HuntersMark,
    serpentSting: SerpentSting,
    naturalMending: NaturalMending,
    trailblazer: Trailblazer,
    carefulAim: CarefulAim,

    //Traits and talents
    traitsAndTalents: TraitsAndTalents,
  };
}

export default CombatLogParser;
