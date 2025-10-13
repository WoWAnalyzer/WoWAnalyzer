import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import {
  BindingShot,
  Deathblow,
  DeathTracker,
  ExplosiveShot,
  FocusCapTracker,
  FocusDetails,
  FocusTracker,
  MasterMarksman,
  NaturalMending,
  RejuvenatingWind,
  SpellFocusCost,
  Trailblazer,
  TranquilizingShot,
} from '../shared';
import KillShotSurvival from './modules/talents/KillShotSurvival';
import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Bloodseeker from './modules/talents/Bloodseeker';
import Buffs from './modules/Buffs';
import Butchery from './modules/talents/Butchery';
import Checklist from './modules/checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import CoordinatedAssault from './modules/talents/CoordinatedAssault';
import FlankingStrike from './modules/talents/FlankingStrike';
import Focus from './modules/resources/Focus';
import GlobalCooldown from './modules/core/GlobalCooldown';
import KillCommand from './modules/talents/KillCommand';
import MongooseBite from './modules/talents/MongooseBite';
import RaptorStrike from './modules/talents/RaptorStrike';
import SurvivalFocusUsage from './modules/resources/SurvivalFocusUsage';
import TipOfTheSpear from './modules/talents/TipOfTheSpear';
import TipOfTheSpearNormalizer from './normalizers/TipOfTheSpear';
import WildfireBomb from './modules/talents/WildfireBomb';
import FrenzyStrikes from './modules/talents/FrenzyStrikes';
import Lunge from './modules/talents/Lunge';
import GrenadeJuggler from './modules/talents/GrenadeJuggler';
import VipersVenom from './modules/talents/VipersVenom';
import FuryOfTheEagle from './modules/talents/FuryOfTheEagle';
import FocusGraph from './modules/guide/sections/resources/FocusGraph';
import Guide from './modules/guide/Guide';
import SurvivalOfTheFittest from '../shared/talents/SurvivalOfTheFittest';
import ExhilarationTiming from '../shared/guide/defensives/Exhiliration';
import EventLinkNormalizer from '../shared/normalizers/HunterEventLinkNormalizers';
import StampedeAnalyzer from '../shared/herotalents/Stampede';

class CombatLogParser extends CoreCombatLogParser {
  static guide = Guide;
  static specModules = {
    // Core statistics
    abilities: Abilities,
    checklist: Checklist,
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

    //Guide
    focusGraph: FocusGraph,
    exhilarationTiming: ExhilarationTiming,

    //Normalizers
    tipOfTheSpearNormalizer: TipOfTheSpearNormalizer,
    EventLinkNormalizers: EventLinkNormalizer,

    //DeathTracker
    deathTracker: DeathTracker,

    //Spells
    bloodseeker: Bloodseeker,
    butchery: Butchery,
    coordinatedAssault: CoordinatedAssault,
    flankingStrike: FlankingStrike,
    frenzyStrikes: FrenzyStrikes,
    killCommand: KillCommand,
    mongooseBite: MongooseBite,
    raptorStrike: RaptorStrike,
    tipOfTheSpear: TipOfTheSpear,
    wildfireBomb: WildfireBomb,
    lunge: Lunge,
    grenadeJuggler: GrenadeJuggler,
    vipersVenom: VipersVenom,
    furyOfTheEagle: FuryOfTheEagle,

    //Shared Talents
    stampedeTier: StampedeAnalyzer,
    bindingShot: BindingShot,
    deathBlow: Deathblow,
    explosiveShot: ExplosiveShot,
    killShotSurvival: KillShotSurvival,
    masterMarksman: MasterMarksman,
    naturalMending: NaturalMending,
    rejuvenatingWind: RejuvenatingWind,
    trailblazer: Trailblazer,
    tranquilizingShot: TranquilizingShot,
    SurvivalOfTheFittest: SurvivalOfTheFittest,

    // Survival's throughput benefit isn't as big as for other classes
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: 0.5 }] as const,
  };
}

export default CombatLogParser;
