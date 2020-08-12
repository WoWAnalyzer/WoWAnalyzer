import CoreCombatLogParser from 'parser/core/CombatLogParser';

//Overridden Racial
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

//Overridden Core modules
import GlobalCooldown from './modules/core/GlobalCooldown';
import SpellUsable from './modules/core/SpellUsable';

//Features
import Abilities from './modules/Abilities';
import Channeling from './modules/features/Channeling';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CancelledCasts from '../shared/modules/features/CancelledCasts';
import Buffs from './modules/Buffs';

//Death Tracker
import DeathTracker from '../shared/modules/core/DeathTracker';

//Focus
import FocusTracker from '../shared/modules/resources/FocusTracker';
import FocusDetails from '../shared/modules/resources/FocusDetails';
import SpellFocusCost from '../shared/modules/resources/SpellFocusCost';
import FocusCapTracker from '../shared/modules/resources/FocusCapTracker';
import Focus from './modules/resources/Focus';
import MarksmanshipFocusUsage from './modules/resources/MarksmanshipFocusUsage';

//Spells
import Trueshot from './modules/spells/Trueshot';
import LoneWolf from './modules/spells/LoneWolf';
import PreciseShots from './modules/spells/PreciseShots';
import AimedShot from './modules/spells/AimedShot';
import RapidFire from './modules/spells/RapidFire';
import HuntersMark from '../shared/modules/spells/HuntersMark';
import KillShot from '../shared/modules/spells/KillShot';
import BindingShot from '../shared/modules/talents/BindingShot';

//Talents
import AMurderOfCrows from '../shared/modules/talents/AMurderOfCrows';
import Barrage from '../shared/modules/talents/Barrage';
import Volley from './modules/talents/Volley';
import ExplosiveShot from './modules/talents/ExplosiveShot';
import LockAndLoad from './modules/talents/LockAndLoad';
import MasterMarksman from './modules/talents/MasterMarksman';
import DoubleTap from './modules/talents/DoubleTap';
import CallingTheShots from './modules/talents/CallingTheShots';
import SerpentSting from './modules/talents/SerpentSting';
import NaturalMending from '../shared/modules/talents/NaturalMending';
import Trailblazer from '../shared/modules/talents/Trailblazer';
import SteadyFocus from './modules/talents/SteadyFocus';
import BornToBeWild from '../shared/modules/talents/BornToBeWild';
import CarefulAim from './modules/talents/CarefulAim';
import DeadEye from './modules/talents/DeadEye';
import ChimaeraShot from './modules/talents/ChimaeraShot';
import LethalShots from './modules/talents/LethalShots';
import Streamline from './modules/talents/Streamline';

//Azerite Traits
import FocusedFire from './modules/spells/azeritetraits/FocusedFire';
import SteadyAim from './modules/spells/azeritetraits/SteadyAim';
import SurgingShots from './modules/spells/azeritetraits/SurgingShots';
import InTheRhythm from './modules/spells/azeritetraits/InTheRhythm';
import UnerringVision from './modules/spells/azeritetraits/UnerringVision';
import RapidReload from '../shared/modules/spells/azeritetraits/RapidReload';

//Covenants
import ResonatingArrow from '../shared/modules/spells/covenants/kyrian/ResonatingArrow';
import DeathChakrams from '../shared/modules/spells/covenants/necrolord/DeathChakrams';
import WildSpirits from '../shared/modules/spells/covenants/nightfae/WildSpirits';
import FlayedShot from '../shared/modules/spells/covenants/venthyr/FlayedShot';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core statistics
    abilities: Abilities,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,
    spellUsable: SpellUsable,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    cancelledCasts: CancelledCasts,
    buffs: Buffs,

    //Resources
    focusTracker: FocusTracker,
    focusDetails: FocusDetails,
    spellFocusCost: SpellFocusCost,
    focusCapTracker: FocusCapTracker,
    focus: Focus,
    marksmanshipFocusUsage: MarksmanshipFocusUsage,

    //DeathTracker
    deathTracker: DeathTracker,

    //Spells
    trueshot: Trueshot,
    loneWolf: LoneWolf,
    preciseShots: PreciseShots,
    aimedShot: AimedShot,
    rapidFire: RapidFire,
    bindingShot: BindingShot,
    huntersMark: HuntersMark,
    KillShot: KillShot,

    //Talents
    volley: Volley,
    explosiveShot: ExplosiveShot,
    aMurderOfCrows: AMurderOfCrows,
    lockAndLoad: LockAndLoad,
    barrage: Barrage,
    masterMarksman: MasterMarksman,
    doubleTap: DoubleTap,
    callingTheShots: CallingTheShots,
    serpentSting: SerpentSting,
    steadyFocus: SteadyFocus,
    naturalMending: NaturalMending,
    trailblazer: Trailblazer,
    bornToBeWild: BornToBeWild,
    carefulAim: CarefulAim,
    chimaeraShot: ChimaeraShot,
    deadEye: DeadEye,
    lethalShots: LethalShots,
    streamline: Streamline,

    //Azerite Traits
    focusedFire: FocusedFire,
    steadyAim: SteadyAim,
    surgingShots: SurgingShots,
    inTheRhythm: InTheRhythm,
    unerringVision: UnerringVision,
    rapidReload: RapidReload,

    //Covenants
    resonatingArrow: ResonatingArrow,
    deathChakrams: DeathChakrams,
    wildSpirits: WildSpirits,
    flayedShot: FlayedShot,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
}

export default CombatLogParser;
