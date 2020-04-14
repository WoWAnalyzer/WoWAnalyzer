import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Abilities from './modules/Abilities';
import Stormbringer from './modules/core/Stormbringer';

import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/Checklist/Module';
import Flametongue from './modules/core/Flametongue';
import FlametongueRefresh from './modules/core/FlametongueRefresh';
import Rockbiter from './modules/core/Rockbiter';


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
import CrashingStorm from './modules/talents/CrashingStorm';
import FuryOfAir from './modules/talents/FuryOfAir';
import Sundering from './modules/talents/Sundering';
import EarthenSpike from './modules/talents/EarthenSpike';

import AnkhNormalizer from '../shared/normalizers/AnkhNormalizer';
import AstralShift from '../shared/spells/AstralShift';
import PackSpirit from '../shared/azerite/PackSpirit';
import SereneSpirit from '../shared/azerite/SereneSpirit';
import NaturalHarmony from '../shared/azerite/NaturalHarmony';
import AncestralResonance from '../shared/azerite/AncestralResonance';

//Resources
import MaelstromDetails from '../shared/maelstromchart/MaelstromDetails';
import MaelstromTracker from '../shared/maelstromchart/MaelstromTracker';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // ShamanCore
    flametongue: Flametongue,
    rockbiter: Rockbiter,
    flametongueRefresh: FlametongueRefresh,
    stormbringer: Stormbringer,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    checklist: Checklist,
    cooldownThroughputTracker: CooldownThroughputTracker,

    //Talents
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
    crashingStorm: CrashingStorm,
    furyOfAir: FuryOfAir,
    sundering: Sundering,
    earthenSpike: EarthenSpike,

    ankhNormalizer: AnkhNormalizer,
    astralShift: AstralShift,
    packSpirit: PackSpirit,
    sereneSpirit: SereneSpirit,
    naturalHarmony: NaturalHarmony,
    ancestralResonance: AncestralResonance,

    maelstromTracker: MaelstromTracker,
    maelstromDetails: MaelstromDetails,

  };
}

export default CombatLogParser;
