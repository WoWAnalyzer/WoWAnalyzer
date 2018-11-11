import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';
import Abilities from './modules/Abilities';

import MaelstromTracker from '../shared/maelstromchart/MaelstromTracker';
import MaelstromTab from '../shared/maelstromchart/MaelstromTab';

import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/Checklist/Module';
import Flametongue from './modules/core/Flametongue';
import FlametongueRefresh from './modules/core/FlametongueRefresh';
import Rockbiter from './modules/core/Rockbiter';

import CrashingStorm from './modules/talents/CrashingStorm';
import EarthenSpike from './modules/talents/EarthenSpike';
import FuryOfAir from './modules/talents/FuryOfAir';
import ForcefulWinds from './modules/talents/ForcefulWinds';
import Hailstorm from './modules/talents/Hailstorm';
import HotHand from './modules/talents/HotHand';
import Landslide from './modules/talents/Landslide';
import SearingAssault from './modules/talents/SearingAssault';
import Sundering from './modules/talents/Sundering';

import SpiritWolf from '../shared/talents/SpiritWolf';
import StaticCharge from '../shared/talents/StaticCharge';
import AnkhNormalizer from '../shared/normalizers/AnkhNormalizer';
import AstralShift from '../shared/spells/AstralShift';
import PackSpirit from '../shared/azerite/PackSpirit';
import SereneSpirit from '../shared/azerite/SereneSpirit';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // ShamanCore
    damageDone: [DamageDone, { showStatistic: true }],
    flametongue: Flametongue,
    rockbiter: Rockbiter,
    flametongueRefresh: FlametongueRefresh,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    checklist: Checklist,
    cooldownThroughputTracker: CooldownThroughputTracker,

    //Talents
    crashingStorm: CrashingStorm,
    earthenSpike: EarthenSpike,
    forcefulWinds: ForcefulWinds,
    furyOfAir: FuryOfAir,
    hailstorm: Hailstorm,
    hotHand: HotHand,
    landslide: Landslide,
    searingAssault: SearingAssault,
    sundering: Sundering,

    spiritWolf: SpiritWolf,
    staticCharge: StaticCharge,
    maelstromTracker: MaelstromTracker,
    maelstromTab: MaelstromTab,
    ankhNormalizer: AnkhNormalizer,
    astralShift: AstralShift,
    packSpirit: PackSpirit,
    sereneSpirit: SereneSpirit,
  };
}

export default CombatLogParser;
