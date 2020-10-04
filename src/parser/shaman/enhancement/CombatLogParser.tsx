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
import Stormbringer from './modules/core/Stormbringer';
// Talents
import HotHand from './modules/talents/HotHand';
import ForcefulWinds from './modules/talents/ForcefulWinds';
import SpiritWolf from '../shared/talents/SpiritWolf';
import EarthShield from '../shared/talents/EarthShield';
import StaticCharge from '../shared/talents/StaticCharge';
import Hailstorm from './modules/talents/Hailstorm';
import NaturesGuardian from './modules/talents/NaturesGuardian';
import CrashingStorm from './modules/talents/CrashingStorm';
import Sundering from './modules/talents/Sundering';
import EarthenSpike from './modules/talents/EarthenSpike';

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
    stormbringer: Stormbringer,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    buffs: Buffs,
    checklist: Checklist,
    cooldownThroughputTracker: CooldownThroughputTracker,

    // Talents
    //lashingFlames: LashingFlames,
    forcefulWinds: ForcefulWinds,
    //elementalBlase: ElementalBlast,
    //stormfury: Stormfury,
    hotHand: HotHand,
    //icyStrike: IcyStrike,
    spiritWolf: SpiritWolf,
    earthShield: EarthShield,
    staticCharge: StaticCharge,
    //elementalAssault: ElementalAssault,
    hailstorm: Hailstorm,
    naturesGuardian: NaturesGuardian,
    crashingStorm: CrashingStorm,
    //stormkeeper: Stormkeeper,
    sundering: Sundering,
    //elementalSpirits: ElementalSpirits,
    earthenSpike: EarthenSpike,
    //ascendance: Ascendance,
  };
}

export default CombatLogParser;
