import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Abilities';
import Overload from './Modules/Features/Overload';

import FlameShock from './Modules/ShamanCore/FlameShock';
import FireElemental from './Modules/Features/FireElemental';

import Aftershock from './Modules/Talents/Aftershock';
import ElementalBlast from './Modules/Talents/ElementalBlast';
import Ascendance from './Modules/Talents/Ascendance';
import TotemMastery from './Modules/Talents/TotemMastery';
import ExposedElements from './Modules/Talents/ExposedElements';
import MasterOfTheElements from './Modules/Talents/MasterOfTheElements';

import Tier21_2Set from './Modules/Items/Tier21_2set.js';
import Tier21_4Set from './Modules/Items/Tier21_4set.js';

import TheDeceiversBloodPact from './Modules/Items/TheDeceiversBloodPact';
import EchoesOfTheGreatSundering from './Modules/Items/EchoesOfTheGreatSundering';
import SmolderingHeart from './Modules/Items/SmolderingHeart';
import EyeOfTheTwistingNether from '../Shared/Items/EyeOfTheTwistingNether';

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
    elementalBlast: ElementalBlast,
    ascendance: Ascendance,
    totemMastery: TotemMastery,
    exposedElements: ExposedElements,
    masterOfTheElements: MasterOfTheElements,

    // Legendaries:
    theDeceiversBloodPact: TheDeceiversBloodPact,
    echoesOfTheGreatSundering: EchoesOfTheGreatSundering,
    smolderingHeart: SmolderingHeart,
    eyeOfTheTwistingNether: EyeOfTheTwistingNether,

    //Setboni
    tier21_2p: Tier21_2Set,
    tier21_4p: Tier21_4Set,

    staticCharge: StaticCharge,
    maelstromTracker: MaelstromTracker,
    maelstromTab: MaelstromTab,
  };

}

export default CombatLogParser;
