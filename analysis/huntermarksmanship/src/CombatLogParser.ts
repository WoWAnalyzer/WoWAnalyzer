import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

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
  ResonatingArrow,
  DeathChakrams,
  WildSpirits,
  FlayedShot,
  EnfeebledMark,
  EmpoweredRelease,
  NecroticBarrage,
  SpiritAttunement,
  MarkmansAdvantage,
  ResilienceOfTheHunter,
  ReversalOfFortune,
  RejuvenatingWind,
  HarmonyOfTheTortollan,
  SoulforgeEmbers,
  CancelledCasts,
} from '@wowanalyzer/hunter';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import GlobalCooldown from './modules/core/GlobalCooldown';
import SpellUsable from './modules/core/SpellUsable';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import EagletalonsTrueFocus from './modules/items/EagletalonsTrueFocus';
import NesingwarysTrappingApparatus from './modules/items/NesingwarysTrappingApparatus';
import SecretsOfTheUnblinkingVigil from './modules/items/SecretsOfTheUnblinkingVigil';
import SerpentstalkersTrickery from './modules/items/SerpentstalkersTrickery';
import SurgingShots from './modules/items/SurgingShots';
import Focus from './modules/resources/Focus';
import MarksmanshipFocusCapTracker from './modules/resources/MarksmanshipFocusCapTracker';
import MarksmanshipFocusUsage from './modules/resources/MarksmanshipFocusUsage';
import AimedShot from './modules/spells/AimedShot';
import BrutalProjectiles from './modules/spells/conduits/BrutalProjectiles';
import DeadlyChain from './modules/spells/conduits/DeadlyChain';
import PowerfulPrecision from './modules/spells/conduits/PowerfulPrecision';
import SharpshootersFocus from './modules/spells/conduits/SharpshootersFocus';
import LoneWolf from './modules/spells/LoneWolf';
import PreciseShots from './modules/spells/PreciseShots';
import RapidFire from './modules/spells/RapidFire';
import SteadyShot from './modules/spells/SteadyShot';
import Trueshot from './modules/spells/Trueshot';
import CallingTheShots from './modules/talents/CallingTheShots';
import CarefulAim from './modules/talents/CarefulAim';
import ChimaeraShot from './modules/talents/ChimaeraShot';
import DeadEye from './modules/talents/DeadEye';
import DoubleTap from './modules/talents/DoubleTap';
import ExplosiveShot from './modules/talents/ExplosiveShot';
import LethalShots from './modules/talents/LethalShots';
import LockAndLoad from './modules/talents/LockAndLoad';
import MasterMarksman from './modules/talents/MasterMarksman';
import SerpentSting from './modules/talents/SerpentSting';
import SteadyFocus from './modules/talents/SteadyFocus';
import Streamline from './modules/talents/Streamline';
import Volley from './modules/talents/Volley';
import AimedShotPrepullNormalizer from './normalizers/AimedShotPrepullNormalizer';

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

    //Covenants
    resonatingArrow: ResonatingArrow,
    deathChakrams: DeathChakrams,
    wildSpirits: WildSpirits,
    flayedShot: FlayedShot,

    //Conduits
    empoweredRelease: EmpoweredRelease,
    enfeebledMark: EnfeebledMark,
    necroticBarrage: NecroticBarrage,
    spiritAttunement: SpiritAttunement,
    brutalProjectiles: BrutalProjectiles,
    deadlyChain: DeadlyChain,
    powerfulPrecision: PowerfulPrecision,
    sharpshootersFocus: SharpshootersFocus,
    markmansAdvantage: MarkmansAdvantage,
    resilienceOfTheHunter: ResilienceOfTheHunter,
    reversalOfFortune: ReversalOfFortune,
    rejuvenatingWind: RejuvenatingWind,
    harmonyOfTheTortollan: HarmonyOfTheTortollan,

    //Generic Legendaries
    nesingwarysTrappingApparatus: NesingwarysTrappingApparatus,
    soulforgeEmbers: SoulforgeEmbers,

    //Marksmanship Legendaries
    surgingShots: SurgingShots,
    serpentstalkersTrickery: SerpentstalkersTrickery,
    secretsOfTheUnblinkingVigil: SecretsOfTheUnblinkingVigil,
    eagletalonsTrueFocus: EagletalonsTrueFocus,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,
  };
}

export default CombatLogParser;
