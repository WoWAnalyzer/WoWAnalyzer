import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import Abilities from './Modules/Abilities';

import MaelstromTracker from '../Shared/MaelstromChart/MaelstromTracker';
import MaelstromTab from '../Shared/MaelstromChart/MaelstromTab';

import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Flametongue from './Modules/ShamanCore/Flametongue';
import FlametongueRefresh from './Modules/ShamanCore/FlametongueRefresh';
import Rockbiter from './Modules/ShamanCore/Rockbiter';

import CrashingStorm from './Modules/Talents/CrashingStorm';
import Landslide from './Modules/Talents/Landslide';
import Hailstorm from './Modules/Talents/Hailstorm';
import FuryOfAir from './Modules/Talents/FuryOfAir';

import StaticCharge from '../Shared/Talents/StaticCharge';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // ShamanCore
    damageDone: [DamageDone, { showStatistic: true }],
    flametongue: Flametongue,
    landslide: Landslide,
    hailstorm: Hailstorm,
    furyOfAir: FuryOfAir,
    rockbiter: Rockbiter,
    flametongueRefresh: FlametongueRefresh,
    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,

    //Talents
    crashingStorm:CrashingStorm,

    staticCharge: StaticCharge,
    maelstromTracker:MaelstromTracker,
    maelstromTab:MaelstromTab,
  };


}

export default CombatLogParser;
