import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Abilities from './modules/Abilities';
// Shared Shaman
import AnkhNormalizer from '../shared/normalizers/AnkhNormalizer';
import AstralShift from '../shared/spells/AstralShift';
// Resources
import MaelstromDetails from '../shared/maelstromchart/MaelstromDetails';
import MaelstromTracker from '../shared/maelstromchart/MaelstromTracker';
// Features
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/checklist/Module';
import Buffs from './modules/Buffs';
// Enhancement Core
import Flametongue from './modules/core/Flametongue';
import FlametongueRefresh from './modules/core/FlametongueRefresh';
import Rockbiter from './modules/core/Rockbiter';
import Stormbringer from './modules/core/Stormbringer';
// Talents
import BoulderFist from './modules/talents/Boulderfist';
import HotHand from './modules/talents/HotHand';
import LightningShield from './modules/talents/LightningShield';
import Landslide from './modules/talents/Landslide';
import ForcefulWinds from './modules/talents/ForcefulWinds';
import TotemMastery from './modules/talents/TotemMastery';
import SpiritWolf from '../shared/talents/SpiritWolf';
import EarthShield from '../shared/talents/EarthShield';
import StaticCharge from '../shared/talents/StaticCharge';
import SearingAssault from './modules/talents/SearingAssault';
import Hailstorm from './modules/talents/Hailstorm';
import NaturesGuardian from './modules/talents/NaturesGuardian';
import CrashingStorm from './modules/talents/CrashingStorm';
import FuryOfAir from './modules/talents/FuryOfAir';
import Sundering from './modules/talents/Sundering';
import EarthenSpike from './modules/talents/EarthenSpike';
// Azerite
import PackSpirit from '../shared/azerite/PackSpirit';
import SereneSpirit from '../shared/azerite/SereneSpirit';
import NaturalHarmony from '../shared/azerite/NaturalHarmony';
import AncestralResonance from '../shared/azerite/AncestralResonance';
import LightningConduit from './modules/azerite/LightningConduit';
import PrimalPrimer from './modules/azerite/PrimalPrimer';
import RoilingStorm from './modules/azerite/RoilingStorm';
import ThunderaansFury from './modules/azerite/ThunderaansFury';
import StrengthOfEarth from './modules/azerite/StrengthOfEarth';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Shaman Shared
    ankhNormalizer: AnkhNormalizer,
    astralShift: AstralShift,

    // Resources
    maelstromTracker: MaelstromTracker,
    maelstromDetails: MaelstromDetails,

    // Shaman Core
    flametongue: Flametongue,
    flametongueRefresh: FlametongueRefresh,
    rockbiter: Rockbiter,
    stormbringer: Stormbringer,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    buffs: Buffs,
    checklist: Checklist,
    cooldownThroughputTracker: CooldownThroughputTracker,

    // Talents
    boulderfist: BoulderFist,
    hotHand: HotHand,
    lightningShield: LightningShield,
    landslide: Landslide,
    forcefulWinds: ForcefulWinds,
    totemMastery: TotemMastery,
    spiritWolf: SpiritWolf,
    earthShield: EarthShield,
    staticCharge: StaticCharge,
    searingAssault: SearingAssault,
    hailstorm: Hailstorm,
    naturesGuardian: NaturesGuardian,
    crashingStorm: CrashingStorm,
    furyOfAir: FuryOfAir,
    sundering: Sundering,
    earthenSpike: EarthenSpike,

    // Azerite
    packSpirit: PackSpirit,
    sereneSpirit: SereneSpirit,
    naturalHarmony: NaturalHarmony,
    ancestralResonance: AncestralResonance,
    lightningConduit: LightningConduit,
    primalPrimer: PrimalPrimer,
    roilingStorm: RoilingStorm,
    strengthOfEarth: StrengthOfEarth,
    thunderaansFury: ThunderaansFury,
  };
}

export default CombatLogParser;
