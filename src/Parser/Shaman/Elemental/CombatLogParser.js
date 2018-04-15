import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import ProcTracker from './Modules/Features/ProcTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Overload from './Modules/Features/Overload';

import FlameShock from './Modules/ShamanCore/FlameShock';
import FrostShock from './Modules/ShamanCore/FrostShock';
import EarthShock from './Modules/ShamanCore/EarthShock';
import ElementalFocus from './Modules/ShamanCore/ElementalFocus';
import FireElemental from './Modules/Features/FireElemental';

import Aftershock from './Modules/Talents/Aftershock';
import ElementalBlast from './Modules/Talents/ElementalBlast';
import Ascendance from './Modules/Talents/Ascendance';
import TotemMastery from './Modules/Talents/TotemMastery';
import LightningRod from './Modules/Talents/LightningRod';

import './Modules/Main/main.css';

import MaelstromTab from '../Shared/MaelstromChart/MaelstromTab';
import MaelstromTracker from '../Shared/MaelstromChart/MaelstromTracker';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    damageDone: [DamageDone, { showStatistic: true }],

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    procTracker: ProcTracker,
    flameShock: FlameShock,
    frostShock: FrostShock,
    earthShock: EarthShock,
    overload: Overload,
    elementalFocus: ElementalFocus,
    fireElemental: FireElemental,

    // Talents
    aftershock: Aftershock,
    elementalBlast: ElementalBlast,
    ascendance: Ascendance,
    totemMastery: TotemMastery,
    lightningRod: LightningRod,

    maelstromTracker: MaelstromTracker,
    maelstromTab: MaelstromTab,
  };
}

export default CombatLogParser;
