import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import GlobalCooldown from './modules/core/GlobalCooldown';
import Channeling from './modules/features/Channeling';
import Abilities from './modules/Abilities';
import SpellUsable from './modules/core/SpellUsable';

//Features
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CancelledCasts from '../shared/modules/features/CancelledCasts';
import FocusUsage from '../shared/modules/resources/FocusUsage';

//Focus
import FocusTracker from '../shared/modules/resources/FocusTracker';
import FocusDetails from '../shared/modules/resources/FocusDetails';
import SpellFocusCost from '../shared/modules/resources/SpellFocusCost';
import FocusCapTracker from '../shared/modules/resources/FocusCapTracker';
import Focus from './modules/core/Focus';

//Spells
import Trueshot from './modules/spells/Trueshot';
import LoneWolf from './modules/spells/LoneWolf';
import PreciseShots from './modules/spells/PreciseShots';
import AimedShot from './modules/spells/AimedShot';

//Talents
import AMurderOfCrows from '../shared/modules/talents/AMurderOfCrows';
import Barrage from '../shared/modules/talents/Barrage';
import Volley from './modules/talents/Volley';
import ExplosiveShot from './modules/talents/ExplosiveShot';
import LockAndLoad from './modules/talents/LockAndLoad';
import PiercingShot from './modules/talents/PiercingShot';
import MasterMarksman from './modules/talents/MasterMarksman';
import DoubleTap from './modules/talents/DoubleTap';
import CallingTheShots from './modules/talents/CallingTheShots';
import HuntersMark from './modules/talents/HuntersMark';
import SerpentSting from './modules/talents/SerpentSting';
import NaturalMending from '../shared/modules/talents/NaturalMending';
import Trailblazer from '../shared/modules/talents/Trailblazer';
import SteadyFocus from './modules/talents/SteadyFocus';
import BornToBeWild from '../shared/modules/talents/BornToBeWild';
import BindingShot from '../shared/modules/talents/BindingShot';
import CarefulAim from './modules/talents/CarefulAim';

//Azerite Traits
import FocusedFire from './modules/spells/azeritetraits/FocusedFire';
import SteadyAim from './modules/spells/azeritetraits/SteadyAim';
import SurgingShots from './modules/spells/azeritetraits/SurgingShots';
import InTheRhythm from './modules/spells/azeritetraits/InTheRhythm';
import UnerringVision from './modules/spells/azeritetraits/UnerringVision';

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
    focusUsage: FocusUsage,

    //Resources
    focusTracker: FocusTracker,
    focusDetails: FocusDetails,
    spellFocusCost: SpellFocusCost,
    focusCapTracker: FocusCapTracker,
    focus: Focus,

    //Spells
    trueshot: Trueshot,
    loneWolf: LoneWolf,
    preciseShots: PreciseShots,
    aimedShot: AimedShot,

    //Talents
    volley: Volley,
    explosiveShot: ExplosiveShot,
    aMurderOfCrows: AMurderOfCrows,
    lockAndLoad: LockAndLoad,
    piercingShot: PiercingShot,
    barrage: Barrage,
    masterMarksman: MasterMarksman,
    doubleTap: DoubleTap,
    callingTheShots: CallingTheShots,
    huntersMark: HuntersMark,
    serpentSting: SerpentSting,
    steadyFocus: SteadyFocus,
    naturalMending: NaturalMending,
    trailblazer: Trailblazer,
    bornToBeWild: BornToBeWild,
    bindingShot: BindingShot,
    carefulAim: CarefulAim,

    //Azerite Traits
    focusedFire: FocusedFire,
    steadyAim: SteadyAim,
    surgingShots: SurgingShots,
    inTheRhythm: InTheRhythm,
    unerringVision: UnerringVision,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }],
  };
}

export default CombatLogParser;
