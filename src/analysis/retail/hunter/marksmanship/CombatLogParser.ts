import {
  Barrage,
  BindingShot,
  BornToBeWild,
  CancelledCasts,
  Channeling,
  DeathTracker,
  FocusDetails,
  FocusTracker,
  KillShot,
  NaturalMending,
  RejuvenatingWind,
  SpellFocusCost,
  Trailblazer,
  TranquilizingShot,
} from '../shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import GlobalCooldown from './modules/core/GlobalCooldown';
import SpellUsable from './modules/core/SpellUsable';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';

import SurgingShots from './modules/talents/SurgingShots';
import Focus from './modules/resources/Focus';
import MarksmanshipFocusCapTracker from './modules/resources/MarksmanshipFocusCapTracker';
import MarksmanshipFocusUsage from './modules/resources/MarksmanshipFocusUsage';
import AimedShot from './modules/talents/AimedShot';
import LoneWolf from './modules/spells/LoneWolf';
import PreciseShots from './modules/spells/PreciseShots';
import RapidFire from './modules/spells/RapidFire';
import SteadyShot from './modules/spells/SteadyShot';
import Trueshot from './modules/spells/Trueshot';
import CallingTheShots from './modules/talents/CallingTheShots';

import ExplosiveShot from '../shared/talents/ExplosiveShot';
import LockAndLoad from './modules/talents/LockAndLoad';
import MasterMarksman from '../shared/talents/MasterMarksman';
import Streamline from './modules/talents/Streamline';
import Volley from './modules/talents/Volley';
import AimedShotPrepullNormalizer from './normalizers/AimedShotPrepullNormalizer';
import Deathblow from '../shared/talents/Deathblow';
import MMTier2P from './modules/items/MMTier2P';
import MMTier4P from './modules/items/MMTier4P';
import FoundationGuide from 'interface/guide/foundation/FoundationGuide';
import OvinaxMercurialEgg from 'parser/retail/modules/items/thewarwithin/trinkets/OvinaxMercurialEgg';
import MadQueensMandate from 'parser/retail/modules/items/thewarwithin/trinkets/MadQueensMandate';
import SkardynsGrace from 'parser/retail/modules/items/thewarwithin/trinkets/SkardynsGrace';
import BlackArrow from '../shared/talents/BlackArrow';

class CombatLogParser extends CoreCombatLogParser {
  static guide = FoundationGuide;

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

    //DeathTracker
    deathTracker: DeathTracker,

    //Spells
    trueshot: Trueshot,
    loneWolf: LoneWolf,
    preciseShots: PreciseShots,
    rapidFire: RapidFire,
    steadyShot: SteadyShot,
    killShot: KillShot,
    bindingShot: BindingShot,

    //Talents
    aimedShot: AimedShot,
    volley: Volley,
    lockAndLoad: LockAndLoad,
    callingTheShots: CallingTheShots,

    streamline: Streamline,
    deathblow: Deathblow,
    surgingShots: SurgingShots,

    //Shared Talents
    rejuvenatingWind: RejuvenatingWind,
    tranquilizingShot: TranquilizingShot,
    trailblazer: Trailblazer,
    naturalMending: NaturalMending,
    bornToBeWild: BornToBeWild,
    explosiveShot: ExplosiveShot,
    masterMarksman: MasterMarksman,
    barrage: Barrage,
    blackArrow: BlackArrow,

    // items
    mmTier2P: MMTier2P,
    mmTier4P: MMTier4P,
    ovinaxMercurialEgg: OvinaxMercurialEgg,
    madQueensMandate: MadQueensMandate,
    skardynsGrace: SkardynsGrace,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
}

export default CombatLogParser;
