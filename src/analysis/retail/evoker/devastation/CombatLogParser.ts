import MainCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';

import ShatteringStar from './modules/abilities/ShatteringStar';
import Buffs from './modules/Buffs';
import Guide from './Guide';
import AplCheck from './modules/AplCheck/AplCheck';
import Disintegrate from './modules/abilities/Disintegrate';
import EssenceBurst from './modules/abilities/EssenceBurst';
import Burnout from './modules/abilities/Burnout';
import DragonRage from './modules/abilities/DragonRage';
import CastLinkNormalizer from './modules/normalizers/CastLinkNormalizer';
import EssenceBurstNormalizer from './modules/normalizers/EssenceBurstNormalizer';
import Snapfire from './modules/abilities/Snapfire';
import T30DevaTier4P from './modules/dragonflight/tier/T30DevaTier4P';
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
import T31DevaTier from './modules/dragonflight/tier/T31DevaTier';

// Shared
import {
  LivingFlameNormalizer,
  LivingFlamePrePullNormalizer,
  EssenceBurstCastLinkNormalizer,
  EssenceBurstRefreshNormalizer,
  /* LeapingFlamesBuffNormalizer, */
  LeapingFlamesNormalizer,
  LeapingFlames,
  EmpowerNormalizer,
  SpellUsable,
  GlobalCooldown,
  SpellEssenceCost,
  EssenceTracker,
  EssenceGraph,
  SourceOfMagic,
  PotentMana,
  ObsidianScales,
  DefensiveNormalizer,
  DefensiveCastLinkNormalizer,
  TwinGuardian,
  RenewingBlaze,
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
    /* leapingFlamesBuffNormalizer: LeapingFlamesBuffNormalizer, */
    leapingFlamesNormalizer: LeapingFlamesNormalizer,
    leapingFlames: LeapingFlames,
    spellEssenceCost: SpellEssenceCost,
    essenceTracker: EssenceTracker,
    essenceGraph: EssenceGraph,
    sourceOfMagic: SourceOfMagic,
    potentMana: PotentMana,

    obsidianScales: ObsidianScales,
    defensiveCastLinkNormalizer: DefensiveCastLinkNormalizer,
    defensiveNormalizer: DefensiveNormalizer,
    twinGuardian: TwinGuardian,
    renewingBlaze: RenewingBlaze,

    // Core
    abilities: Abilities,
    buffs: Buffs,

    // Normalizer
    castLinkNormalizer: CastLinkNormalizer,
    essenceBurstNormalizer: EssenceBurstNormalizer,

    // features
    apls: AplCheck,
    cooldownThroughputTracker: CooldownThroughputTracker,

    // talents
    catalyze: Catalyze,
    scintillation: Scintillation,
    causality: Causality,
    volatility: Volatility,
    arcaneIntensity: ArcaneIntensity,
    snapfire: Snapfire,
    heatWave: HeatWave,
    spellweaversDominance: SpellweaversDominance,
    honedAggression: HonedAggression,
    titanicWrath: TitanicWrath,
    eyeOfInfinity: EyeOfInfinity,
    engulfingBlaze: EngulfingBlaze,
    layWaste: LayWaste,
    iridescence: Iridescence,

    // core abilities
    disintegrate: Disintegrate,
    shatteringStar: ShatteringStar,
    essenceBurst: EssenceBurst,
    burnout: Burnout,
    dragonRage: DragonRage,

    // tier
    T30devaTier4P: T30DevaTier4P,
    T31devaTier: T31DevaTier,
  };

  static guide = Guide;
}

export default CombatLogParser;
