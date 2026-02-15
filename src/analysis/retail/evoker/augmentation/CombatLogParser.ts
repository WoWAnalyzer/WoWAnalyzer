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
import MomentumShift from './modules/talents/MomentumShift';
import Overlord from './modules/talents/Overlord';
import HoardedPower from './modules/talents/HoardedPower';
import MotesOfPossibility from './modules/talents/MotesOfPossibility';
import Duplicate from './modules/talents/Duplicate';

import BuffTrackerGraph from './modules/features/BuffTrackerGraph';
import BlisteringScalesGraph from './modules/talents/BlisteringScalesGraph';
import BlisteringScalesStackTracker from './modules/talents/BlisteringScalesStackTracker';

import PrescienceNormalizer from './modules/normalizers/PrescienceNormalizer';
import CastLinkNormalizer from './modules/normalizers/CastLinkNormalizer';
import EbonMightNormalizer from './modules/normalizers/EbonMightNormalizer';

// Tier
import MID1Augmentation2P from './modules/midnight/MID1Augmentation2P';
import MID1Augmentation4P from './modules/midnight/MID1Augmentation4P';

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
  Chronoflame,
  Reverberations,
  Primacy,
  TimeConvergence,
  GoldenOpportunity,
  MotesOfAcceleration,
  TimeSpiral,
  RefinedEssence,
  CommandSquadron,
  NozdormuAdept,
  ImminentDestructionCastLinkNormalizer,
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

    obsidianScales: ObsidianScales,
    defensiveCastLinkNormalizer: DefensiveCastLinkNormalizer,
    mobilityCastLinkNormalizer: MobilityCastLinkNormalizer,
    defensiveNormalizer: DefensiveNormalizer,
    timeSpiral: TimeSpiral,
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
    momentumShift: MomentumShift,
    overlord: Overlord,
    hoardedPower: HoardedPower,
    motesOfPossibility: MotesOfPossibility,
    duplicate: Duplicate,

    // hero talents
    mightOfTheBlackDragonflight: MightOfTheBlackDragonflight,
    meltArmor: MeltArmor,
    extendedBattle: ExtendedBattle,
    divertedPower: DivertedPower,
    unrelentingSiege: UnrelentingSiege,
    wingLeader: Wingleader,
    slipstream: Slipstream,
    chronoflame: Chronoflame,
    reverberations: Reverberations,
    primacy: Primacy,
    timeConvergence: TimeConvergence,
    goldenOpportunity: GoldenOpportunity,
    motesOfAcceleration: MotesOfAcceleration,
    refinedEssence: RefinedEssence,
    commandSquadron: CommandSquadron,
    nozdormuAdept: NozdormuAdept,

    // Features
    buffTrackerGraph: BuffTrackerGraph,

    // Tier
    MID1Augmentation2P: MID1Augmentation2P,
    MID1Augmentation4P: MID1Augmentation4P,
  };
  static guide = Guide;
}

export default CombatLogParser;
