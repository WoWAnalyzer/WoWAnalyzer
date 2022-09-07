import {
  DeathTracker,
  NaturalMending,
  Trailblazer,
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
  EmpoweredRelease,
  NecroticBarrage,
  SpiritAttunement,
  ResilienceOfTheHunter,
  ReversalOfFortune,
  RejuvenatingWind,
  HarmonyOfTheTortollan,
  SoulforgeEmbers,
  EnfeebledMark,
  MarkmansAdvantage,
  FragmentsOfTheElderAntlers,
} from 'analysis/retail/hunter/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import GlobalCooldown from './modules/core/GlobalCooldown';
import SpellUsable from './modules/core/SpellUsable';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import ButchersBoneFragments from './modules/items/ButchersBoneFragments';
import LatentPoisonInjectors from './modules/items/LatentPoisonInjectors';
import NesingwarysTrappingApparatus from './modules/items/NesingwarysTrappingApparatus';
import RylakstalkersConfoundingStrikes from './modules/items/RylakstalkersConfoundingStrikes';
import WildfireCluster from './modules/items/WildfireCluster';
import Focus from './modules/resources/Focus';
import SurvivalFocusCapTracker from './modules/resources/SurvivalFocusCapTracker';
import SurvivalFocusUsage from './modules/resources/SurvivalFocusUsage';
import ButcheryCarve from './modules/spells/ButcheryCarve';
import DeadlyTandem from './modules/spells/conduits/DeadlyTandem';
import FlameInfusion from './modules/spells/conduits/FlameInfusion';
import StingingStrike from './modules/spells/conduits/StingingStrike';
import StrengthOfThePack from './modules/spells/conduits/StrengthOfThePack';
import CoordinatedAssault from './modules/spells/CoordinatedAssault';
import KillCommand from './modules/spells/KillCommand';
import RaptorStrike from './modules/spells/RaptorStrike';
import SerpentSting from './modules/spells/SerpentSting';
import WildfireBomb from './modules/spells/WildfireBomb';
import AlphaPredator from './modules/talents/AlphaPredator';
import BirdOfPrey from './modules/talents/BirdOfPrey';
import Bloodseeker from './modules/talents/Bloodseeker';
import Chakrams from './modules/talents/Chakrams';
import FlankingStrike from './modules/talents/FlankingStrike';
import GuerrillaTactics from './modules/talents/GuerrillaTactics';
import HydrasBite from './modules/talents/HydrasBite';
import MongooseBite from './modules/talents/MongooseBite';
import SteelTrap from './modules/talents/SteelTrap';
import TipOfTheSpear from './modules/talents/TipOfTheSpear';
import VipersVenom from './modules/talents/VipersVenom';
import PheromoneBomb from './modules/talents/WildfireInfusion/PheromoneBomb';
import ShrapnelBomb from './modules/talents/WildfireInfusion/ShrapnelBomb';
import VolatileBomb from './modules/talents/WildfireInfusion/VolatileBomb';
import TipOfTheSpearNormalizer from './normalizers/TipOfTheSpear';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core statistics
    abilities: Abilities,
    checklist: Checklist,
    globalCooldown: GlobalCooldown,
    spellUsable: SpellUsable,

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
    killCommand: KillCommand,
    butcheryCarve: ButcheryCarve,
    serpentSting: SerpentSting,
    coordinatedAssault: CoordinatedAssault,
    wildfireBomb: WildfireBomb,
    raptorStrike: RaptorStrike,
    killShot: KillShot,

    //Talents
    naturalMending: NaturalMending,
    trailblazer: Trailblazer,
    aMurderOfCrows: AMurderOfCrows,
    vipersVenom: VipersVenom,
    mongooseBite: MongooseBite,
    steelTrap: SteelTrap,
    guerrillaTactics: GuerrillaTactics,
    chakrams: Chakrams,
    birdOfPrey: BirdOfPrey,
    bornToBeWild: BornToBeWild,
    bindingShot: BindingShot,
    alphaPredator: AlphaPredator,
    bloodseeker: Bloodseeker,
    hydrasBite: HydrasBite,
    flankingStrike: FlankingStrike,
    tipOfTheSpear: TipOfTheSpear,
    pheromoneBomb: PheromoneBomb,
    shrapnelBomb: ShrapnelBomb,
    volatileBomb: VolatileBomb,

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
    deadlyTandem: DeadlyTandem,
    flameInfusion: FlameInfusion,
    stingingStrike: StingingStrike,
    strengthOfThePack: StrengthOfThePack,
    markmansAdvantage: MarkmansAdvantage,
    resilienceOfTheHunter: ResilienceOfTheHunter,
    reversalOfFortune: ReversalOfFortune,
    rejuvenatingWind: RejuvenatingWind,
    harmonyOfTheTortollan: HarmonyOfTheTortollan,

    //Generic Legendaries
    nesingwarysTrappingApparatus: NesingwarysTrappingApparatus,
    soulforgeEmbers: SoulforgeEmbers,
    fragmentsOfTheElderAntlers: FragmentsOfTheElderAntlers,

    //Survival Legendaries
    wildfireCluster: WildfireCluster,
    latentPoisonInjectors: LatentPoisonInjectors,
    rylakstalkersConfoundingStrikes: RylakstalkersConfoundingStrikes,
    butchersBoneFragments: ButchersBoneFragments,

    // Survival's throughput benefit isn't as big as for other classes
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: 0.5 }] as const,
  };
}

export default CombatLogParser;
