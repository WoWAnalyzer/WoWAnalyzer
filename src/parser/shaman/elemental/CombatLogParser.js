import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import CancelledCasts from './modules/features/CancelledCasts';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Overload from './modules/features/Overload';

import FlameShock from './modules/core/FlameShock';
import LavaSurge from './modules/core/LavaSurge';
import StormFireElemental from './modules/features/StormFireElemental';

import Aftershock from './modules/talents/Aftershock';
import CallTheThunder from './modules/talents/CallTheThunder';
import Ascendance from './modules/talents/Ascendance';
import EarthenRage from './modules/talents/EarthenRage';
import ElementalBlast from './modules/talents/ElementalBlast';
import LiquidMagmaTotem from './modules/talents/LiquidMagmaTotem';
import MasterOfTheElements from './modules/talents/MasterOfTheElements';
import PrimalFireElemental from './modules/talents/PrimalFireElemental';
import PrimalStormElemental from './modules/talents/PrimalStormElemental';
import StormElemental from './modules/talents/StormElemental';
import Stormkeeper from './modules/talents/Stormkeeper';
import TotemMastery from './modules/talents/TotemMastery';
import UnlimitedPower from './modules/talents/UnlimitedPower';
import UnlimitedPowerTimesByStacks from './modules/talents/UnlimitedPowerTimesByStacks';
import SurgeOfPower from './modules/talents/SurgeOfPower';
import Icefury from './modules/talents/Icefury';

import Checklist from './modules/checklist/Module';
import Buffs from './modules/Buffs';

import NaturalHarmony from '../shared/azerite/NaturalHarmony';
import LavaShock from './modules/azerite/LavaShock';
import SynapseShock from '../shared/azerite/SynapseShock';
import EchoOfTheElementals from './modules/azerite/EchoOfTheElementals';

import EarthShield from '../shared/talents/EarthShield';
import SpiritWolf from '../shared/talents/SpiritWolf';
import StaticCharge from '../shared/talents/StaticCharge';
import AnkhNormalizer from '../shared/normalizers/AnkhNormalizer';
import AstralShift from '../shared/spells/AstralShift';
import PackSpirit from '../shared/azerite/PackSpirit';
import SereneSpirit from '../shared/azerite/SereneSpirit';
import IgneousPotential from '../shared/azerite/IgneousPotential';
import AncestralResonance from '../shared/azerite/AncestralResonance';

//Resources
import MaelstromDetails from '../shared/maelstromchart/MaelstromDetails';
import MaelstromTracker from '../shared/maelstromchart/MaelstromTracker';
import MaelstromTab from '../shared/maelstromchart/MaelstromTab';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    flameShock: FlameShock,
    lavaSurge: LavaSurge,
    overload: Overload,
    stormfireElemental: StormFireElemental,
    buffs: Buffs,
    cancelledCasts: CancelledCasts,
    alwaysBeCasting: AlwaysBeCasting,

    // Talents
    aftershock: Aftershock,
    callthethunder: CallTheThunder,
    ascendance: Ascendance,
    earthenRage: EarthenRage,
    elementalBlast: ElementalBlast,
    stormElemental: StormElemental,
    liquidMagmaTotem: LiquidMagmaTotem,
    masterOfTheElements: MasterOfTheElements,
    surgeOfPower: SurgeOfPower,
    primalFireElemental: PrimalFireElemental,
    primalStormElemental: PrimalStormElemental,
    totemMastery: TotemMastery,
    stormkeeper: Stormkeeper,
    unlimitedPowerTimesByStacks: UnlimitedPowerTimesByStacks,
    unlimitedPower: UnlimitedPower,
    icefury: Icefury,
    earthShield: EarthShield,

    // Azerite
    naturalHarmony: NaturalHarmony,
    lavaShock: LavaShock,
    synapseShock: SynapseShock,
    echoOfTheElementals: EchoOfTheElementals,

    spiritWolf: SpiritWolf,
    staticCharge: StaticCharge,
    maelstromTracker: MaelstromTracker,
    maelstromDetails: MaelstromDetails,
    maelstromTab: MaelstromTab,
    ankhNormalizer: AnkhNormalizer,
    checklist: Checklist,
    astralShift: AstralShift,
    packSpirit: PackSpirit,
    sereneSpirit: SereneSpirit,
    igneousPotential: IgneousPotential,
    ancestralResonance: AncestralResonance,
  };

}

export default CombatLogParser;
