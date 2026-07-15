import {
  BindingShot,
  CancelledCasts,
  Channeling,
  DeathTracker,
  FocusCapTracker,
  FocusDetails,
  FocusTracker,
  SpellFocusCost,
  TranquilizingShot,
} from '../shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import GlobalCooldown from './modules/core/GlobalCooldown';
import SpellUsable from './modules/core/SpellUsable';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';

import SurgingShots from './modules/talents/SurgingShots';
import KillShot from './modules/talents/KillShot';
import Focus from './modules/resources/Focus';
import MarksmanshipFocusUsage from './modules/resources/MarksmanshipFocusUsage';
import AimedShot from './modules/talents/AimedShot';
import PreciseShots from './modules/talents/PreciseShots';
import RapidFire from './modules/talents/RapidFire';
import SteadyShot from './modules/spells/SteadyShot';
import Trueshot from './modules/talents/Trueshot';
import CallingTheShots from './modules/talents/CallingTheShots';
import LockAndLoad from './modules/talents/LockAndLoad';
import MasterMarksman from '../shared/talents/MasterMarksman';
import Volley from './modules/talents/Volley';
import FocusedAim from './modules/talents/FocusedAim';
import AimedShotPrepullNormalizer from './normalizers/AimedShotPrepullNormalizer';
import Deathblow from '../shared/talents/Deathblow';
import SentinelsMark from '../shared/herotalents/SentinelsMark';
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

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    cancelledCasts: CancelledCasts,
    buffs: Buffs,

    //Resources
    focusTracker: FocusTracker,
    focusDetails: FocusDetails,
    focusCapTracker: FocusCapTracker,
    spellFocusCost: SpellFocusCost,
    focus: Focus,
    marksmanshipFocusUsage: MarksmanshipFocusUsage,

    //Normalizers
    aimedShotPrepullNormalizer: AimedShotPrepullNormalizer,

    //DeathTracker
    deathTracker: DeathTracker,

    //Spells
    trueshot: Trueshot,
    preciseShots: PreciseShots,
    rapidFire: RapidFire,
    steadyShot: SteadyShot,
    killShot: KillShot,
    bindingShot: BindingShot,

    //Talents
    aimedShot: AimedShot,
    volley: Volley,
    focusedAim: FocusedAim,
    lockAndLoad: LockAndLoad,
    callingTheShots: CallingTheShots,
    deathblow: Deathblow,
    surgingShots: SurgingShots,

    //Shared Talents
    tranquilizingShot: TranquilizingShot,
    masterMarksman: MasterMarksman,
    blackArrow: BlackArrow,
    sentinelsMark: SentinelsMark,

    // items
    ovinaxMercurialEgg: OvinaxMercurialEgg,
    madQueensMandate: MadQueensMandate,
    skardynsGrace: SkardynsGrace,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
}

export default CombatLogParser;
