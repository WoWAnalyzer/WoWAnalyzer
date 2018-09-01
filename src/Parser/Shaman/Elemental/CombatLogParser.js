import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Abilities';
import Overload from './Modules/Features/Overload';

import FlameShock from './Modules/ShamanCore/FlameShock';
import FireElemental from './Modules/Features/FireElemental';

import Aftershock from './Modules/Talents/Aftershock';
import Ascendance from './Modules/Talents/Ascendance';
import EarthenRage from './Modules/Talents/EarthenRage';
import ElementalBlast from './Modules/Talents/ElementalBlast';
import ExposedElements from './Modules/Talents/ExposedElements';
import HighVoltage from './Modules/Talents/HighVoltage';
import LiquidMagmaTotem from './Modules/Talents/LiquidMagmaTotem';
import MasterOfTheElements from './Modules/Talents/MasterOfTheElements';
import PrimalFireElemental from './Modules/Talents/PrimalFireElemental';
import PrimalStormElemental from './Modules/Talents/PrimalStormElemental';
import Stormkeeper from './Modules/Talents/Stormkeeper';
import TotemMastery from './Modules/Talents/TotemMastery';
import UnlimitedPower from './Modules/Talents/UnlimitedPower';
import UnlimitedPowerTimesByStacks from './Modules/Talents/UnlimitedPowerTimesByStacks';


import './Modules/Main/main.css';

import StaticCharge from '../Shared/Talents/StaticCharge';
import MaelstromTab from '../Shared/MaelstromChart/MaelstromTab';
import MaelstromTracker from '../Shared/MaelstromChart/MaelstromTracker';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    damageDone: [DamageDone, { showStatistic: true }],

    // Features
    abilities: Abilities,
    flameShock: FlameShock,
    overload: Overload,
    fireElemental: FireElemental,

    // Talents
    aftershock: Aftershock,
    ascendance: Ascendance,
    earthenRage: EarthenRage,
    elementalBlast: ElementalBlast,
    exposedElements: ExposedElements,
    highVoltage: HighVoltage,
    liquidMagmaTotem: LiquidMagmaTotem,
    masterOfTheElements: MasterOfTheElements,
    primalFireElemental: PrimalFireElemental,
    primalStormElemental: PrimalStormElemental,
    totemMastery: TotemMastery,
    stormkeeper: Stormkeeper,
    //unlimitedPowerTimesByStacks: UnlimitedPower,
    //unlimitedPower: UnlimitedPower,

    staticCharge: StaticCharge,
    maelstromTracker: MaelstromTracker,
    maelstromTab: MaelstromTab,
  };

}

export default CombatLogParser;
