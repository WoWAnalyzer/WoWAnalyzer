import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
// Shared Shaman
import AnkhNormalizer from '../shared/normalizers/AnkhNormalizer';
import AstralShift from '../shared/spells/AstralShift';
// Features
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/checklist/Module';
import Buffs from './modules/Buffs';
// Enhancement Core
import Stormbringer from './modules/core/Stormbringer';
// Talents
import LashingFlames from './modules/talents/LashingFlames';
import HotHand from './modules/talents/HotHand';
import ForcefulWinds from './modules/talents/ForcefulWinds';
import SpiritWolf from '../shared/talents/SpiritWolf';
import EarthShield from '../shared/talents/EarthShield';
import StaticCharge from '../shared/talents/StaticCharge';
import Hailstorm from './modules/talents/Hailstorm';
import NaturesGuardian from './modules/talents/NaturesGuardian';
import CrashingStorm from './modules/talents/CrashingStorm';
import Sundering from './modules/talents/Sundering';
import Stormkeeper from './modules/talents/Stormkeeper';
import EarthenSpike from './modules/talents/EarthenSpike';
import ElementalBlast from '../shared/talents/ElementalBlast';
import Stormflurry from './modules/talents/Stormflurry';
import IceStrike from './modules/talents/IceStrike';
import FireNova from './modules/talents/FireNova';
import ElementalAssault from './modules/talents/ElementalAssault';
import FeralSpirit from './modules/core/FeralSpirit';
import FlameShock from '../shared/spells/FlameShock';
import WindfuryTotem from './modules/core/WindfuryTotem';
import MaelstromWeapon from './modules/core/MaelstromWeapon';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Shaman Shared
    ankhNormalizer: AnkhNormalizer,
    astralShift: AstralShift,

    // Resources

    // maelstromTracker: MaelstromTracker,
    // maelstromDetails: MaelstromDetails,

    // Shaman Core
    stormbringer: Stormbringer,
    feralSpirit: FeralSpirit,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    buffs: Buffs,
    checklist: Checklist,
    cooldownThroughputTracker: CooldownThroughputTracker,
    flameShock: FlameShock,
    windfuryTotem: WindfuryTotem,
    maelstromWeapon: MaelstromWeapon,

    // Talents
    lashingFlames: LashingFlames,
    forcefulWinds: ForcefulWinds,
    elementalBlast: ElementalBlast,
    stormflurry: Stormflurry,
    hotHand: HotHand,
    iceStrike: IceStrike,
    spiritWolf: SpiritWolf,
    earthShield: EarthShield,
    staticCharge: StaticCharge,
    elementalAssault: ElementalAssault,
    hailstorm: Hailstorm,
    fireNova: FireNova,
    naturesGuardian: NaturesGuardian,
    crashingStorm: CrashingStorm,
    stormkeeper: Stormkeeper,
    sundering: Sundering,
    //elementalSpirits: ElementalSpirits,
    earthenSpike: EarthenSpike,
    //ascendance: Ascendance,

    // covenants
    //chainHarvest: ChainHarvest,
    //vesperTotem: VesperTotem,
  };
}

export default CombatLogParser;
