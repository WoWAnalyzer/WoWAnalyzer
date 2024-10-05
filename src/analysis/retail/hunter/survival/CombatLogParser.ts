import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import {
  BindingShot,
  DeathTracker,
  FocusCapTracker,
  FocusDetails,
  FocusTracker,
  KillShot,
  MasterMarksman,
  NaturalMending,
  RejuvenatingWind,
  SpellFocusCost,
  Trailblazer,
  TranquilizingShot,
} from '../shared';
import Abilities from './modules/Abilities';
import AlphaPredator from './modules/talents/AlphaPredator';
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
import GuerrillaTactics from './modules/talents/GuerrillaTactics';
import HydrasBite from './modules/talents/HydrasBite';
import KillCommand from './modules/talents/KillCommand';
import MongooseBite from './modules/talents/MongooseBite';
import RaptorStrike from './modules/talents/RaptorStrike';
import SurvivalFocusUsage from './modules/resources/SurvivalFocusUsage';
import TipOfTheSpear from './modules/talents/TipOfTheSpear';
import TipOfTheSpearNormalizer from './normalizers/TipOfTheSpear';
import WildfireBomb from './modules/talents/WildfireBomb';
import FrenzyStrikes from './modules/talents/FrenzyStrikes';
import RuthlessMarauder from 'analysis/retail/hunter/survival/modules/talents/RuthlessMarauder';

class CombatLogParser extends CoreCombatLogParser {
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

    //Normalizers
    tipOfTheSpearNormalizer: TipOfTheSpearNormalizer,

    //DeathTracker
    deathTracker: DeathTracker,

    //Spells
    alphaPredator: AlphaPredator,
    bloodseeker: Bloodseeker,
    butchery: Butchery,
    coordinatedAssault: CoordinatedAssault,
    flankingStrike: FlankingStrike,
    frenzyStrikes: FrenzyStrikes,
    guerrillaTactics: GuerrillaTactics,
    hydrasBite: HydrasBite,
    killCommand: KillCommand,
    mongooseBite: MongooseBite,
    raptorStrike: RaptorStrike,
    tipOfTheSpear: TipOfTheSpear,
    wildfireBomb: WildfireBomb,
    ruthlessMarauder: RuthlessMarauder,

    //Shared Talents
    bindingShot: BindingShot,
    killShot: KillShot,
    masterMarksman: MasterMarksman,
    naturalMending: NaturalMending,
    rejuvenatingWind: RejuvenatingWind,
    trailblazer: Trailblazer,
    tranquilizingShot: TranquilizingShot,

    // Survival's throughput benefit isn't as big as for other classes
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: 0.5 }] as const,
  };
}

export default CombatLogParser;
