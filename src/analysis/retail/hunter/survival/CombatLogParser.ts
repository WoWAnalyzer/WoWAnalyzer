import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import Channeling from 'parser/shared/normalizers/Channeling';
import {
  BindingShot,
  DeathTracker,
  FocusCapTracker,
  FocusDetails,
  FocusTracker,
  NaturalMending,
  RejuvenatingWind,
  SpellFocusCost,
  Trailblazer,
  TranquilizingShot,
} from '../shared';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Bloodseeker from './modules/talents/Bloodseeker';
import Buffs from './modules/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Focus from './modules/resources/Focus';
import GlobalCooldown from './modules/core/GlobalCooldown';
import KillCommand from './modules/talents/KillCommand';
import RaptorStrike from './modules/talents/RaptorStrike';
import SurvivalFocusUsage from './modules/resources/SurvivalFocusUsage';
import TipOfTheSpearNormalizer from './normalizers/TipOfTheSpear';
import WildfireBomb from './modules/talents/WildfireBomb';
import FocusGraph from './modules/guide/sections/resources/FocusGraph';
import Guide from './modules/guide/Guide';
import SurvivalOfTheFittest from '../shared/talents/SurvivalOfTheFittest';
import ExhilarationTiming from '../shared/guide/defensives/Exhiliration';
import Boomstick from './modules/talents/Boomstick';
import BoomstickNormalizer from './normalizers/BoomstickNormalizer';
import WildfireShells from './modules/talents/WildfireShells';
import LethalCalibration from './modules/talents/LethalCalibration';
import WildfireBombNormalizer from './normalizers/WildfireBombNormalizer';
import TipOfTheSpear from './modules/talents/TipOfTheSpear';
import AplCheck from './modules/apl/AplCheck';
import MoonlightChakram from '../shared/herotalents/MoonlightChakram';
import MoonlightChakramNormalizer from '../shared/normalizers/MoonlightChakramNormalizer';
// import EventLinkNormalizer from '../shared/normalizers/HunterEventLinkNormalizers'; // This has a pack leader normalizer in it useful to Survival so not deleting yet.

class CombatLogParser extends CoreCombatLogParser {
  static guide = Guide;
  static specModules = {
    // Core statistics
    abilities: Abilities,
    globalCooldown: GlobalCooldown,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    buffs: Buffs,

    //Resources
    focusTracker: FocusTracker,
    focusDetails: FocusDetails,
    spellFocusCost: SpellFocusCost,
    focusCapTracker: FocusCapTracker,
    focus: Focus,
    survivalFocusUsage: SurvivalFocusUsage,
    wildfireShells: WildfireShells,
    lethalCalibration: LethalCalibration,

    //Guide
    focusGraph: FocusGraph,
    exhilarationTiming: ExhilarationTiming,

    //Normalizers
    // Channeling must come before BoomstickNormalizer to ensure EndChannel events exist
    channeling: Channeling,
    tipOfTheSpearNormalizer: TipOfTheSpearNormalizer,
    boomstickNormalizer: BoomstickNormalizer,
    wildfireBombNormalizer: WildfireBombNormalizer,
    moonlightChakramNormalizer: MoonlightChakramNormalizer,
    // EventLinkNormalizers: EventLinkNormalizer,

    //DeathTracker
    deathTracker: DeathTracker,

    //Spells
    bloodseeker: Bloodseeker,
    killCommand: KillCommand,
    raptorStrike: RaptorStrike,
    wildfireBomb: WildfireBomb,
    boomstick: Boomstick,
    tipOfTheSpear: TipOfTheSpear,

    //Shared Talents
    moonlightChakram: MoonlightChakram,
    bindingShot: BindingShot,
    naturalMending: NaturalMending,
    rejuvenatingWind: RejuvenatingWind,
    trailblazer: Trailblazer,
    tranquilizingShot: TranquilizingShot,
    SurvivalOfTheFittest: SurvivalOfTheFittest,

    // Survival's throughput benefit isn't as big as for other classes
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: 0.5 }] as const,

    // APL section.
    apl: AplCheck,
  };
}

export default CombatLogParser;
