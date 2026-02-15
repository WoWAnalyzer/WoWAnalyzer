import MainCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';

import Buffs from './modules/Buffs';
import Guide from './Guide';
//import AplCheck from './modules/AplCheck/AplCheck';
import Disintegrate from './modules/abilities/Disintegrate';
import EssenceBurst from './modules/abilities/EssenceBurst';
import Burnout from './modules/abilities/Burnout';
import DragonRage from './modules/abilities/DragonRage';
import CastLinkNormalizer from './modules/normalizers/CastLinkNormalizer';
import EssenceBurstNormalizer from './modules/normalizers/EssenceBurstNormalizer';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Catalyze from './modules/talents/Catalyze';
import Scintillation from './modules/talents/Scintillation';
import Causality from './modules/talents/Causality';
import Volatility from './modules/talents/Volatility';
import ArcaneIntensity from './modules/talents/ArcaneIntensity';
import HeatWave from './modules/talents/HeatWave';
import SpellweaversDominance from './modules/talents/SpellweaversDominance';
import HonedAggression from './modules/talents/HonedAggression';
import TitanicWrath from './modules/talents/TitanicWrath';
import EyeOfInfinity from './modules/talents/EyeOfInfinity';
import EngulfingBlaze from './modules/talents/EngulfingBlaze';
import LayWaste from './modules/talents/LayWaste';
import Iridescence from './modules/talents/Iridescence';
import Pyre from './modules/abilities/Pyre';
import EternitySurgeNormalizer from './modules/normalizers/EternitySurgeNormalizer';
import ScorchingEmbers from './modules/talents/ScorchingEmbers';
import AlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import CancelledCasts from 'parser/shared/modules/CancelledCasts';
import DisintegrateChainCastLinks from './modules/normalizers/DisintegrateChainCastLinks';
import StrafingRun from './modules/talents/StrafingRun';
import SpellUsable from './modules/features/SpellUsable';
import StrafingRunNormalizer from './modules/normalizers/StrafingRun';
import AzureSweep from './modules/talents/AzureSweep';
import ShatteringStars from './modules/talents/ShatteringStars';
import StarSalvo from './modules/talents/StarSalvo';

// Shared
import {
  LivingFlameNormalizer,
  LivingFlamePrePullNormalizer,
  EssenceBurstCastLinkNormalizer,
  EssenceBurstRefreshNormalizer,
  LeapingFlamesNormalizer,
  LeapingFlames,
  EmpowerNormalizer,
  GlobalCooldown,
  SpellEssenceCost,
  EssenceTracker,
  EssenceGraph,
  SourceOfMagic,
  PotentMana,
  ObsidianScales,
  DefensiveNormalizer,
  DefensiveCastLinkNormalizer,
  MobilityCastLinkNormalizer,
  ImminentDestruction,
  MeltArmor,
  MassDisintegrate,
  MightOfTheBlackDragonflight,
  ExtendedBattle,
  DivertedPower,
  UnrelentingSiege,
  Wingleader,
  Slipstream,
  ExpandedLungs,
  TimeSpiral,
  RefinedEssence,
  CommandSquadron,
  ImminentDestructionCastLinkNormalizer,
  EssenceWell,
  TwinFlame,
  FireTorrent,
} from 'analysis/retail/evoker/shared';

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    // Empower Normalizer
    empowerNormalizer: EmpowerNormalizer,
    spellUsable: SpellUsable,
    globalCooldown: GlobalCooldown,

    // Shared
    livingFlameNormalizer: LivingFlameNormalizer,
    livingFlamePrePullNormalizer: LivingFlamePrePullNormalizer,
    essenceBurstRefreshNormalizer: EssenceBurstRefreshNormalizer,
    essenceBurstCastLinkNormalizer: EssenceBurstCastLinkNormalizer,
    leapingFlamesNormalizer: LeapingFlamesNormalizer,
    imminentDestructionCastLinkNormalizer: ImminentDestructionCastLinkNormalizer,
    leapingFlames: LeapingFlames,
    spellEssenceCost: SpellEssenceCost,
    essenceTracker: EssenceTracker,
    essenceGraph: EssenceGraph,
    sourceOfMagic: SourceOfMagic,
    potentMana: PotentMana,
    imminentDestruction: ImminentDestruction,
    essenceWell: EssenceWell,
    twinFlame: TwinFlame,
    fireTorrent: FireTorrent,

    obsidianScales: ObsidianScales,
    defensiveCastLinkNormalizer: DefensiveCastLinkNormalizer,
    defensiveNormalizer: DefensiveNormalizer,
    mobilityCastLinkNormalizer: MobilityCastLinkNormalizer,
    timeSpiral: TimeSpiral,

    // Core
    abilities: Abilities,
    buffs: Buffs,

    // Normalizer
    castLinkNormalizer: CastLinkNormalizer,
    essenceBurstNormalizer: EssenceBurstNormalizer,
    eternitySurgeNormalizer: EternitySurgeNormalizer,
    disintegrateChainCastLinks: DisintegrateChainCastLinks,
    strafingRunNormalizer: StrafingRunNormalizer,

    // features
    //apls: AplCheck,
    cooldownThroughputTracker: CooldownThroughputTracker,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,

    // talents
    catalyze: Catalyze,
    scintillation: Scintillation,
    causality: Causality,
    volatility: Volatility,
    arcaneIntensity: ArcaneIntensity,
    heatWave: HeatWave,
    spellweaversDominance: SpellweaversDominance,
    honedAggression: HonedAggression,
    titanicWrath: TitanicWrath,
    eyeOfInfinity: EyeOfInfinity,
    engulfingBlaze: EngulfingBlaze,
    layWaste: LayWaste,
    iridescence: Iridescence,
    scorchingEmbers: ScorchingEmbers,
    strafingRun: StrafingRun,
    azureSweep: AzureSweep,
    shatteringStars: ShatteringStars,
    starSalvo: StarSalvo,

    // hero talents
    expandedLungs: ExpandedLungs,
    meltArmor: MeltArmor,
    massDisintegrate: MassDisintegrate,
    mightOfTheBlackDragonflight: MightOfTheBlackDragonflight,
    extendedBattle: ExtendedBattle,
    divertedPower: DivertedPower,
    unrelentingSiege: UnrelentingSiege,
    wingLeader: Wingleader,
    slipstream: Slipstream,
    refinedEssence: RefinedEssence,
    commandSquadron: CommandSquadron,

    // core abilities
    disintegrate: Disintegrate,
    essenceBurst: EssenceBurst,
    burnout: Burnout,
    dragonRage: DragonRage,
    pyre: Pyre,

    // tier
  };

  static guide = Guide;
}

export default CombatLogParser;
