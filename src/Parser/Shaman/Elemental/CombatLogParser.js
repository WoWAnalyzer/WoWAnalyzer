import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import ProcTracker from './Modules/Features/ProcTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Overload from './Modules/Features/Overload';

import FlameShock from './Modules/ShamanCore/FlameShock';
import FireElemental from './Modules/Features/FireElemental';

import Aftershock from './Modules/Talents/Aftershock';
import ElementalBlast from './Modules/Talents/ElementalBlast';
import Ascendance from './Modules/Talents/Ascendance';
import TotemMastery from './Modules/Talents/TotemMastery';

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
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    procTracker: ProcTracker,
    flameShock: FlameShock,
    overload: Overload,
    fireElemental: FireElemental,

    // Talents
    aftershock: Aftershock,
    elementalBlast: ElementalBlast,
    ascendance: Ascendance,
    totemMastery: TotemMastery,

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
