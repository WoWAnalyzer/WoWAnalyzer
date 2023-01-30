import {
  Channeling,
  DeathTracker,
  NaturalMending,
  Trailblazer,
  Barrage,
  AMurderOfCrows,
  BornToBeWild,
  BindingShot,
  KillShot,
  FocusTracker,
  FocusDetails,
  SpellFocusCost,
  DeathChakrams,
  RejuvenatingWind,
  CancelledCasts,
  WailingArrow,
  WailingArrowPrepullNormalizer,
} from 'analysis/retail/hunter/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Abilities from './modules/Abilities';
import AplCheck from './modules/apl/AplCheck';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import GlobalCooldown from './modules/core/GlobalCooldown';
import SpellUsable from './modules/core/SpellUsable';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import EagletalonsTrueFocus from './modules/talents/EagletalonsTrueFocus';
import SerpentstalkersTrickery from './modules/talents/SerpentstalkersTrickery';
import SurgingShots from './modules/talents/SurgingShots';
import Focus from './modules/resources/Focus';
import MarksmanshipFocusCapTracker from './modules/resources/MarksmanshipFocusCapTracker';
import MarksmanshipFocusUsage from './modules/resources/MarksmanshipFocusUsage';
import AimedShot from './modules/spells/AimedShot';
import LoneWolf from './modules/spells/LoneWolf';
import PreciseShots from './modules/spells/PreciseShots';
import RapidFire from './modules/spells/RapidFire';
import SteadyShot from './modules/spells/SteadyShot';
import Trueshot from './modules/spells/Trueshot';
import CallingTheShots from './modules/talents/CallingTheShots';
import CarefulAim from './modules/talents/CarefulAim';
import ChimaeraShot from './modules/talents/ChimaeraShot';
import ExplosiveShot from '../shared/talents/ExplosiveShot';
import LethalShots from './modules/talents/LethalShots';
import LockAndLoad from './modules/talents/LockAndLoad';
import MasterMarksman from '../shared/talents/MasterMarksman';
import SerpentSting from '../shared/talents/SerpentSting';
import SteadyFocus from './modules/talents/SteadyFocus';
import Streamline from './modules/talents/Streamline';
import Volley from './modules/talents/Volley';
import AimedShotPrepullNormalizer from './normalizers/AimedShotPrepullNormalizer';
import Deathblow from './modules/talents/Deathblow';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core statistics
    abilities: Abilities,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,
    spellUsable: SpellUsable,
    checklist: Checklist,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    cancelledCasts: CancelledCasts,
    buffs: Buffs,

    //Resources
    focusTracker: FocusTracker,
    focusDetails: FocusDetails,
    spellFocusCost: SpellFocusCost,
    marksmanshipFocusCapTracker: MarksmanshipFocusCapTracker,
    focus: Focus,
    marksmanshipFocusUsage: MarksmanshipFocusUsage,

    //Normalizers
    aimedShotPrepullNormalizer: AimedShotPrepullNormalizer,
    wailingArrowPrepullNormalizer: WailingArrowPrepullNormalizer,

    //DeathTracker
    deathTracker: DeathTracker,

    //Spells
    trueshot: Trueshot,
    loneWolf: LoneWolf,
    preciseShots: PreciseShots,
    aimedShot: AimedShot,
    rapidFire: RapidFire,
    steadyShot: SteadyShot,
    killShot: KillShot,
    bindingShot: BindingShot,

    //Talents
    volley: Volley,
    explosiveShot: ExplosiveShot,
    aMurderOfCrows: AMurderOfCrows,
    lockAndLoad: LockAndLoad,
    barrage: Barrage,
    masterMarksman: MasterMarksman,
    callingTheShots: CallingTheShots,
    serpentSting: SerpentSting,
    steadyFocus: SteadyFocus,
    naturalMending: NaturalMending,
    trailblazer: Trailblazer,
    bornToBeWild: BornToBeWild,
    carefulAim: CarefulAim,
    chimaeraShot: ChimaeraShot,
    lethalShots: LethalShots,
    streamline: Streamline,
    wailingArrow: WailingArrow,
    deathblow: Deathblow,

    //Shared Talents
    rejuvenatingWind: RejuvenatingWind,
    deathChakrams: DeathChakrams,

    //Marksmanship Legendaries
    surgingShots: SurgingShots,
    serpentstalkersTrickery: SerpentstalkersTrickery,
    eagletalonsTrueFocus: EagletalonsTrueFocus,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,

    // apl
    apl: AplCheck,
  };
}

export default CombatLogParser;
