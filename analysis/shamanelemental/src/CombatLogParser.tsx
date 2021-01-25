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
import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Buffs from './modules/Buffs';

import Abilities from './modules/Abilities';

import AlwaysBeCasting from './modules/features/AlwaysBeCasting';

import Aftershock from './modules/talents/Aftershock';
import Ascendance from './modules/talents/Ascendance';
import EarthenRage from './modules/talents/EarthenRage';
import LiquidMagmaTotem from './modules/talents/LiquidMagmaTotem';
import MasterOfTheElements from './modules/talents/MasterOfTheElements';
import PrimalFireElemental from './modules/talents/PrimalFireElemental';
import PrimalStormElemental from './modules/talents/PrimalStormElemental';
import StormElemental from './modules/talents/StormElemental';
import Stormkeeper from './modules/talents/Stormkeeper';
import UnlimitedPower from './modules/talents/UnlimitedPower';
import UnlimitedPowerTimesByStacks from './modules/talents/UnlimitedPowerTimesByStacks';
import SurgeOfPower from './modules/talents/SurgeOfPower';
import Icefury from './modules/talents/Icefury';
import StaticDischarge from './modules/talents/StaticDischarge';
import EchoingShock from './modules/talents/EchoingShock';

import LavaSurge from './modules/core/LavaSurge';
import CancelledCasts from './modules/features/CancelledCasts';
import Checklist from './modules/checklist/Module';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    flameShock: FlameShock,
    lavaSurge: LavaSurge,
    buffs: Buffs,
    cancelledCasts: CancelledCasts,
    alwaysBeCasting: AlwaysBeCasting,

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
