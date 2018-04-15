import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import Abilities from './Modules/Abilities';
import SpellUsable from '../Shared/Modules/Core/SpellUsable';

//Features
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import VulnerableUptime from './Modules/Features/VulnerableUptime';
import VulnerableTracker from './Modules/Features/AimedInVulnerableTracker';
import TimeFocusCapped from '../Shared/Modules/Features/TimeFocusCapped';
import VulnerableApplications from "./Modules/Features/VulnerableApplications";
import CancelledCasts from "../Shared/Modules/Features/CancelledCasts";
import FocusUsage from '../Shared/Modules/Features/FocusUsage';
//Spells
import Trueshot from './Modules/Spells/Trueshot';
import MarkingTargets from './Modules/Spells/MarkingTargets';

//Focus
import FocusTracker from '../Shared/Modules/Features/FocusChart/FocusTracker';
import FocusTab from '../Shared/Modules/Features/FocusChart/FocusTab';
//Talents
import LockAndLoad from './Modules/Talents/LockAndLoad';
import TrueAim from './Modules/Talents/TrueAim';
import PatientSniperTracker from './Modules/Talents/PatientSniper/PatientSniperTracker';
import PatientSniperDetails from "./Modules/Talents/PatientSniper/PatientSniperDetails";
import Volley from '../Shared/Modules/Talents/Volley';
import ExplosiveShot from "./Modules/Talents/ExplosiveShot";
import PiercingShot from "./Modules/Talents/PiercingShot";
import AMurderOfCrows from "./Modules/Talents/AMurderOfCrows";
import TrickShot from "./Modules/Talents/TrickShot/TrickShot";
import TrickShotCleave from "./Modules/Talents/TrickShot/TrickShotCleave";
import Barrage from '../Shared/Modules/Talents/Barrage';
import BlackArrow from './Modules/Talents/BlackArrow';
import Sidewinders from './Modules/Talents/Sidewinders';
import LoneWolf from './Modules/Talents/LoneWolf';
import CarefulAim from './Modules/Talents/CarefulAim';
import Sentinel from './Modules/Talents/Sentinel';

//Traits
import QuickShot from './Modules/Traits/QuickShot';
import Bullseye from './Modules/Traits/Bullseye';
import CyclonicBurst from './Modules/Traits/CyclonicBurst';
import CallOfTheHunter from './Modules/Traits/CallOfTheHunter';
import LegacyOfTheWindrunners from './Modules/Traits/LegacyOfTheWindrunners';
import Windburst from './Modules/Traits/Windburst';

//Traits and Talents list
import TraitsAndTalents from './Modules/Features/TraitsAndTalents';

//Checklist
import Checklist from './Modules/Features/Checklist';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core statistics
    damageDone: [DamageDone, { showStatistic: true }],
    abilities: Abilities,
    spellUsable: SpellUsable,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    vulnerableUptime: VulnerableUptime,
    vulnerableTracker: VulnerableTracker,
    timeFocusCapped: TimeFocusCapped,
    vulnerableApplications: VulnerableApplications,
    cancelledCasts: CancelledCasts,
    focusUsage: FocusUsage,

    //Focus Chart
    focusTracker: FocusTracker,
    focusTab: FocusTab,

    //Spells
    trueshot: Trueshot,
    markingTargets: MarkingTargets,

    //Talents
    patientSniperTracker: PatientSniperTracker,
    patientSniperDetails: PatientSniperDetails,
    lockAndLoad: LockAndLoad,
    trueAim: TrueAim,
    volley: Volley,
    explosiveShot: ExplosiveShot,
    piercingShot: PiercingShot,
    aMurderOfCrows: AMurderOfCrows,
    trickShot: TrickShot,
    trickShotCleave: TrickShotCleave,
    barrage: Barrage,
    blackArrow: BlackArrow,
    sidewinders: Sidewinders,
    loneWolf: LoneWolf,
    carefulAim: CarefulAim,
    sentinel: Sentinel,

    //Traits
    quickShot: QuickShot,
    bullseye: Bullseye,
    cyclonicBurst: CyclonicBurst,
    callOfTheHunter: CallOfTheHunter,
    legacyOfTheWindrunners: LegacyOfTheWindrunners,
    windburst: Windburst,

    //Traits and Talents list
    traitsAndTalents: TraitsAndTalents,

    //Checklist
    checklist: Checklist,

  };
}

export default CombatLogParser;
