import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import GlobalCooldown from './modules/core/GlobalCooldown';
import Channeling from './modules/features/Channeling';
import Abilities from './modules/Abilities';

//Features
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import TimeFocusCapped from '../shared/modules/features/TimeFocusCapped';
import CancelledCasts from '../shared/modules/features/CancelledCasts';
import FocusUsage from '../shared/modules/features/FocusUsage';

//Spells
import Trueshot from './modules/spells/Trueshot';
import LoneWolf from './modules/spells/LoneWolf';
import PreciseShots from './modules/spells/PreciseShots';

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

//Focus
import FocusTracker from '../shared/modules/features/focuschart/FocusTracker';
import FocusTab from '../shared/modules/features/focuschart/FocusTab';

//Azerite Traits
import SteadyAim from './modules/spells/azeritetraits/SteadyAim';

//Traits and Talents
import SpellsAndTalents from './modules/features/SpellsAndTalents';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core statistics
    damageDone: [DamageDone, { showStatistic: true }],
    abilities: Abilities,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    timeFocusCapped: TimeFocusCapped,
    cancelledCasts: CancelledCasts,
    focusUsage: FocusUsage,

    //Focus Chart
    focusTracker: FocusTracker,
    focusTab: FocusTab,

    //Spells
    trueshot: Trueshot,
    loneWolf: LoneWolf,
    preciseShots: PreciseShots,

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
    steadyAim: SteadyAim,

    //Spells and Talents
    spellsAndTalents: SpellsAndTalents,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }],
  };
}

export default CombatLogParser;
