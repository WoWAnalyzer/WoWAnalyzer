import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/core/modules/DamageDone';

import Abilities from './modules/Abilities';
import Overload from './modules/features/Overload';

import FlameShock from './modules/core/FlameShock';
import FireElemental from './modules/features/FireElemental';

import Aftershock from './modules/talents/Aftershock';
import Ascendance from './modules/talents/Ascendance';
import EarthenRage from './modules/talents/EarthenRage';
import ElementalBlast from './modules/talents/ElementalBlast';
import ExposedElements from './modules/talents/ExposedElements';
import HighVoltage from './modules/talents/HighVoltage';
import LiquidMagmaTotem from './modules/talents/LiquidMagmaTotem';
import MasterOfTheElements from './modules/talents/MasterOfTheElements';
import PrimalFireElemental from './modules/talents/PrimalFireElemental';
import PrimalStormElemental from './modules/talents/PrimalStormElemental';
import Stormkeeper from './modules/talents/Stormkeeper';
import TotemMastery from './modules/talents/TotemMastery';
import UnlimitedPower from './modules/talents/UnlimitedPower';
import UnlimitedPowerTimesByStacks from './modules/talents/UnlimitedPowerTimesByStacks';

import './main.css';

import StaticCharge from '../shared/talents/StaticCharge';
import MaelstromTab from '../shared/MaelstromChart/MaelstromTab';
import MaelstromTracker from '../shared/MaelstromChart/MaelstromTracker';
import AnkhNormalizer from '../shared/normalizers/AnkhNormalizer';

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
    unlimitedPowerTimesByStacks: UnlimitedPowerTimesByStacks,
    unlimitedPower: UnlimitedPower,

    staticCharge: StaticCharge,
    maelstromTracker: MaelstromTracker,
    maelstromTab: MaelstromTab,
    ankhNormalizer: AnkhNormalizer,
  };

}

export default CombatLogParser;
