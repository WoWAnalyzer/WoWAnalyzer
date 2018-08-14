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

//Focus
import FocusTracker from '../Shared/Modules/Features/FocusChart/FocusTracker';
import FocusTab from '../Shared/Modules/Features/FocusChart/FocusTab';

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

    //Traits and talents
    traitsAndTalents: TraitsAndTalents,
  };
}

export default CombatLogParser;
