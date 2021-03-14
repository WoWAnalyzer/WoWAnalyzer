import CoreCombatLogParser from 'parser/core/CombatLogParser';

import {
  AnkhNormalizer,
  AstralShift,
  EarthShield,
  ElementalBlast,
  FlameShock,
  MaelstromDetails,
  MaelstromTab,
  MaelstromTracker,
  SpiritWolf,
  StaticCharge,
} from '@wowanalyzer/shaman';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import LavaSurge from './modules/core/LavaSurge';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CancelledCasts from './modules/features/CancelledCasts';
import SubOptimalChainLightning from './modules/features/SubOptimalChainLightning';
import Aftershock from './modules/talents/Aftershock';
import Ascendance from './modules/talents/Ascendance';
import EarthenRage from './modules/talents/EarthenRage';
import EchoingShock from './modules/talents/EchoingShock';
import Icefury from './modules/talents/Icefury';
import LiquidMagmaTotem from './modules/talents/LiquidMagmaTotem';
import MasterOfTheElements from './modules/talents/MasterOfTheElements';
import PrimalFireElemental from './modules/talents/PrimalFireElemental';
import PrimalStormElemental from './modules/talents/PrimalStormElemental';
import StaticDischarge from './modules/talents/StaticDischarge';
import StormElemental from './modules/talents/StormElemental';
import Stormkeeper from './modules/talents/Stormkeeper';
import SurgeOfPower from './modules/talents/SurgeOfPower';
import UnlimitedPower from './modules/talents/UnlimitedPower';
import UnlimitedPowerTimesByStacks from './modules/talents/UnlimitedPowerTimesByStacks';

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

    // Talents
    earthenRage: EarthenRage,
    //staticDischarge: StaticDischarge,
    aftershock: Aftershock,
    //echoingShock: EchoingShock,
    elementalBlast: ElementalBlast,
    spiritWolf: SpiritWolf,
    earthShield: EarthShield,
    staticCharge: StaticCharge,
    masterOfTheElements: MasterOfTheElements,
    stormElemental: StormElemental,
    liquidMagmaTotem: LiquidMagmaTotem,
    surgeOfPower: SurgeOfPower,
    primalFireElemental: PrimalFireElemental,
    primalStormElemental: PrimalStormElemental,
    icefury: Icefury,
    unlimitedPowerTimesByStacks: UnlimitedPowerTimesByStacks,
    unlimitedPower: UnlimitedPower,
    stormkeeper: Stormkeeper,
    ascendance: Ascendance,
    staticDischarge: StaticDischarge,
    echoingShock: EchoingShock,

    maelstromTracker: MaelstromTracker,
    maelstromDetails: MaelstromDetails,
    maelstromTab: MaelstromTab,
    ankhNormalizer: AnkhNormalizer,
    checklist: Checklist,
    astralShift: AstralShift,
  };
}

export default CombatLogParser;
