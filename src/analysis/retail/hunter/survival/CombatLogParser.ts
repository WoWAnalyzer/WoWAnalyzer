import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import {
  AMurderOfCrows,
  BindingShot,
  BornToBeWild,
  DeathChakrams,
  DeathTracker,
  FocusDetails,
  FocusTracker,
  KillShot,
  MasterMarksman,
  NaturalMending,
  RejuvenatingWind,
  SerpentSting,
  SpellFocusCost,
  SteelTrap,
  Trailblazer,
  TranquilizingShot,
} from '../shared';
import Abilities from './modules/Abilities';
import AlphaPredator from './modules/talents/AlphaPredator';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import BirdOfPrey from './modules/talents/BirdOfPrey';
import Bloodseeker from './modules/talents/Bloodseeker';
import Buffs from './modules/Buffs';
import ButcheryCarve from './modules/talents/ButcheryCarve';
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
import PheromoneBomb from './modules/talents/WildfireInfusion/PheromoneBomb';
import RaptorStrike from './modules/talents/RaptorStrike';
import ShrapnelBomb from './modules/talents/WildfireInfusion/ShrapnelBomb';
import SurvivalFocusCapTracker from './modules/resources/SurvivalFocusCapTracker';
import SurvivalFocusUsage from './modules/resources/SurvivalFocusUsage';
import TipOfTheSpear from './modules/talents/TipOfTheSpear';
import TipOfTheSpearNormalizer from './normalizers/TipOfTheSpear';
import VolatileBomb from './modules/talents/WildfireInfusion/VolatileBomb';
import WildfireBomb from './modules/talents/WildfireBomb';

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
    survivalFocusCapTracker: SurvivalFocusCapTracker,
    focus: Focus,
    survivalFocusUsage: SurvivalFocusUsage,

    //Normalizers
    tipOfTheSpearNormalizer: TipOfTheSpearNormalizer,

    //DeathTracker
    deathTracker: DeathTracker,

    //Spells
    alphaPredator: AlphaPredator,
    birdOfPrey: BirdOfPrey,
    bloodseeker: Bloodseeker,
    butcheryCarve: ButcheryCarve,
    coordinatedAssault: CoordinatedAssault,
    flankingStrike: FlankingStrike,
    guerrillaTactics: GuerrillaTactics,
    hydrasBite: HydrasBite,
    killCommand: KillCommand,
    mongooseBite: MongooseBite,
    pheromoneBomb: PheromoneBomb,
    raptorStrike: RaptorStrike,
    shrapnelBomb: ShrapnelBomb,
    tipOfTheSpear: TipOfTheSpear,
    volatileBomb: VolatileBomb,
    wildfireBomb: WildfireBomb,

    //Shared Talents
    aMurderOfCrows: AMurderOfCrows,
    bindingShot: BindingShot,
    bornToBeWild: BornToBeWild,
    deathChakrams: DeathChakrams,
    killShot: KillShot,
    masterMarksman: MasterMarksman,
    naturalMending: NaturalMending,
    rejuvenatingWind: RejuvenatingWind,
    serpentSting: SerpentSting,
    steelTrap: SteelTrap,
    trailblazer: Trailblazer,
    tranquilizingShot: TranquilizingShot,

    // Survival's throughput benefit isn't as big as for other classes
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: 0.5 }] as const,
  };
}

export default CombatLogParser;
