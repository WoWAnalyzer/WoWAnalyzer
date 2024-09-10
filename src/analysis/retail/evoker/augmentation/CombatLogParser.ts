import MainCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';

import Guide from './Guide';

import SandsOfTime from './modules/abilities/SandsOfTime';
import EbonMight from './modules/abilities/EbonMight';
import ShiftingSands from './modules/abilities/ShiftingSands';
import BreathOfEonsRotational from './modules/breahtofeons/BreathOfEonsRotational';

import TimeSkip from './modules/talents/TimeSkip';
import Accretion from './modules/talents/Accretion';
import Prescience from './modules/talents/Prescience';
import Anachronism from './modules/talents/Anachronism';
import PupilOfAlexstrasza from './modules/talents/PupilOfAlexstrasza';
import RicochetingPyroclast from './modules/talents/RicochetingPyroclast';
import SymbioticBloom from './modules/talents/SymbioticBloom';
import TectonicLocus from './modules/talents/TectonicLocus';
import Volcanism from './modules/talents/Volcanism';
import BlisteringScales from './modules/talents/BlisteringScales';
import MoltenEmbers from './modules/talents/MoltenEmbers';
import RumblingEarth from './modules/talents/RumblingEarth';

import BuffTrackerGraph from './modules/features/BuffTrackerGraph';
import BuffTargetHelper from './modules/features/BuffTargetHelper/BuffTargetHelper';
import BlisteringScalesGraph from './modules/talents/BlisteringScalesGraph';
import BlisteringScalesStackTracker from './modules/talents/BlisteringScalesStackTracker';

import PrescienceNormalizer from './modules/normalizers/PrescienceNormalizer';
import CastLinkNormalizer from './modules/normalizers/CastLinkNormalizer';
import EbonMightNormalizer from './modules/normalizers/EbonMightNormalizer';

// Tier
import T31Augmentation4P from './modules/dragonflight/T31Augmentation4P';

//Shared
import {
  LivingFlameNormalizer,
  LivingFlamePrePullNormalizer,
  EssenceBurstCastLinkNormalizer,
  EssenceBurstRefreshNormalizer,
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
  ImminentDestruction,
  MeltArmor,
  MassDisintegrate,
  MightOfTheBlackDragonflight,
  ExtendedBattle,
  DivertedPower,
  UnrelentingSiege,
  Wingleader,
  Slipstream,
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
    leapingFlames: LeapingFlames,
    spellEssenceCost: SpellEssenceCost,
    essenceTracker: EssenceTracker,
    essenceGraph: EssenceGraph,
    sourceOfMagic: SourceOfMagic,
    potentMana: PotentMana,
    imminentDestruction: ImminentDestruction,

    obsidianScales: ObsidianScales,
    defensiveCastLinkNormalizer: DefensiveCastLinkNormalizer,
    defensiveNormalizer: DefensiveNormalizer,
    twinGuardian: TwinGuardian,
    renewingBlaze: RenewingBlaze,
    massDisintegrate: MassDisintegrate,

    // Normalizers
    castLinkNormalizer: CastLinkNormalizer,
    prescienceNormalizer: PrescienceNormalizer,
    ebonMightNormalizer: EbonMightNormalizer,

    // Core
    abilities: Abilities,
    buffs: Buffs,

    // Abilities
    sandsOfTime: SandsOfTime,
    breathOfEonsRotational: BreathOfEonsRotational,
    ebonMight: EbonMight,
    shiftingSands: ShiftingSands,

    // Talents
    timeSkip: TimeSkip,
    accretion: Accretion,
    blisteringScalesGraph: BlisteringScalesGraph,
    blisteringScalesStackTracker: BlisteringScalesStackTracker,
    prescience: Prescience,
    anachronism: Anachronism,
    pupilOfAlexstrasza: PupilOfAlexstrasza,
    ricochetingPyroclast: RicochetingPyroclast,
    symbioticBloom: SymbioticBloom,
    tectonicLocus: TectonicLocus,
    volcanism: Volcanism,
    blisteringScales: BlisteringScales,
    moltenEmbers: MoltenEmbers,
    rumblingEarth: RumblingEarth,

    // hero talents
    mightOfTheBlackDragonflight: MightOfTheBlackDragonflight,
    meltArmor: MeltArmor,
    extendedBattle: ExtendedBattle,
    divertedPower: DivertedPower,
    unrelentingSiege: UnrelentingSiege,
    wingLeader: Wingleader,
    slipstream: Slipstream,

    // Features
    buffTrackerGraph: BuffTrackerGraph,
    buffTargetHelper: BuffTargetHelper,

    // Tier
    t31Augmentation4P: T31Augmentation4P,
  };
  static guide = Guide;
}

export default CombatLogParser;
