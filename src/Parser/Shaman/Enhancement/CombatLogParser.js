import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import Abilities from './Modules/Abilities';

import MaelstromTracker from '../Shared/MaelstromChart/MaelstromTracker';
import MaelstromTab from '../Shared/MaelstromChart/MaelstromTab';

import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import AlphaWolf from './Modules/ShamanCore/AlphaWolf';
import Flametongue from './Modules/ShamanCore/Flametongue';
import FlametongueRefresh from './Modules/ShamanCore/FlametongueRefresh';
import Landslide from './Modules/ShamanCore/Landslide';
import Frostbrand from './Modules/ShamanCore/Frostbrand';
import FuryOfAir from './Modules/ShamanCore/FuryOfAir';
import Rockbiter from './Modules/ShamanCore/Rockbiter';

// import SmolderingHeart from './Modules/Legendaries/SmolderingHeart';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // ShamanCore
    damageDone: [DamageDone, { showStatistic: true }],
    flametongue: Flametongue,
    landslide: Landslide,
    frostbrand: Frostbrand,
    furyOfAir: FuryOfAir,
    rockbiter: Rockbiter,
    flametongueRefresh: FlametongueRefresh,
    alphaWolf: AlphaWolf,
    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,

    maelstromTracker: MaelstromTracker,
    maelstromTab: MaelstromTab,
  };
}

export default CombatLogParser;
