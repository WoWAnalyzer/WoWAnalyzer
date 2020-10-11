import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Abilities from './modules/Abilities';
import CancelledCasts from './modules/features/CancelledCasts';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Overload from './modules/features/Overload';

import FlameShock from './modules/core/FlameShock';
import LavaSurge from './modules/core/LavaSurge';
import StormFireElemental from './modules/features/StormFireElemental';

import Aftershock from './modules/talents/Aftershock';
import Ascendance from './modules/talents/Ascendance';
import EarthenRage from './modules/talents/EarthenRage';
import ElementalBlast from './modules/talents/ElementalBlast';
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

import Checklist from './modules/checklist/Module';
import Buffs from './modules/Buffs';

import EarthShield from '../shared/talents/EarthShield';
import SpiritWolf from '../shared/talents/SpiritWolf';
import StaticCharge from '../shared/talents/StaticCharge';
import AnkhNormalizer from '../shared/normalizers/AnkhNormalizer';
import AstralShift from '../shared/spells/AstralShift';

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

    maelstromTracker: MaelstromTracker,
    maelstromDetails: MaelstromDetails,
    maelstromTab: MaelstromTab,
    ankhNormalizer: AnkhNormalizer,
    checklist: Checklist,
    astralShift: AstralShift,
  };

}

export default CombatLogParser;
