import {
  AnkhNormalizer,
  AstralShift,
  EarthShield,
  ElementalBlast,
  FlameShock,
  SpiritWolf,
  StaticCharge,
} from 'analysis/retail/shaman/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import LavaSurge from './modules/core/LavaSurge';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CancelledCasts from './modules/features/CancelledCasts';
import SubOptimalChainLightning from './modules/features/SubOptimalChainLightning';
import Aftershock from './modules/talents/Aftershock';
import Ascendance from './modules/talents/Ascendance';
import Icefury from './modules/talents/Icefury';
import LiquidMagmaTotem from './modules/talents/LiquidMagmaTotem';
import MasterOfTheElements from './modules/talents/MasterOfTheElements';
import PrimalFireElemental from './modules/talents/PrimalFireElemental';
import PrimalStormElemental from './modules/talents/PrimalStormElemental';
import StormElemental from './modules/talents/StormElemental';
import Stormkeeper from './modules/talents/Stormkeeper';
import SurgeOfPower from './modules/talents/SurgeOfPower';
import ElementalOrbit from '../shared/talents/ElementalOrbit';
import EarthenHarmony from '../restoration/modules/talents/EarthenHarmony';
import CallToDominance from 'parser/retail/modules/items/dragonflight/CallToDominance';
import ManaSpring from 'analysis/retail/shaman/shared/talents/ManaSpring';
import ElementalGuide from './guide/ElementalGuide';
import SpellMaelstromCost from './modules/core/SpellMaelstromCost';
import SpenderWindow from './modules/features/SpenderWindow';
import MaelstromTracker from './modules/resources/MaelstromTracker';
import MaelstromDetails from './modules/resources/MaelstromDetails';
import MaelstromGraph from './modules/resources/MaelstromGraph';
import ElectrifiedShocks from './modules/talents/ElectrifiedShocks';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    flameShock: FlameShock,
    lavaSurge: LavaSurge,
    buffs: Buffs,
    cancelledCasts: CancelledCasts,
    alwaysBeCasting: AlwaysBeCasting,
    subOptimalChainLightning: SubOptimalChainLightning,
    spenderWindow: SpenderWindow,

    // Talents
    aftershock: Aftershock,
    elementalBlast: ElementalBlast,
    spiritWolf: SpiritWolf,
    earthShield: EarthShield,
    elementalOrbit: ElementalOrbit,
    earthenHarmony: EarthenHarmony,
    staticCharge: StaticCharge,
    masterOfTheElements: MasterOfTheElements,
    stormElemental: StormElemental,
    liquidMagmaTotem: LiquidMagmaTotem,
    surgeOfPower: SurgeOfPower,
    primalFireElemental: PrimalFireElemental,
    primalStormElemental: PrimalStormElemental,
    icefury: Icefury,
    stormkeeper: Stormkeeper,
    ascendance: Ascendance,
    manaSpring: ManaSpring,
    electrifiedShocks: ElectrifiedShocks,

    maelstromTracker: MaelstromTracker,
    maelstromDetails: MaelstromDetails,
    maelstromGraph: MaelstromGraph,
    spellMaelstromCost: SpellMaelstromCost,
    ankhNormalizer: AnkhNormalizer,
    checklist: Checklist,
    astralShift: AstralShift,
    callToDominance: CallToDominance,
  };

  static guide = ElementalGuide;
}

export default CombatLogParser;
