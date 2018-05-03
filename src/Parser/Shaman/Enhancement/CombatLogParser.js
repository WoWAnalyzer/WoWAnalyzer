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
import Tier20_2set from './Modules/Items/Tier20_2set';
import Tier21_2set from './Modules/Items/Tier21_2set';
import Tier21_4set from './Modules/Items/Tier21_4set';

import EyeOfTheTwistingNether from '../Shared/Items/EyeOfTheTwistingNether';
import StaticCharge from '../Shared/Talents/StaticCharge';


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
    // Legendaries:
    eyeOfTheTwistingNether: EyeOfTheTwistingNether,
    // Tier
    tier20_2set: Tier20_2set,
    tier21_2set: Tier21_2set,
    tier21_4set: Tier21_4set,

    staticCharge: StaticCharge,
    maelstromTracker:MaelstromTracker,
    maelstromTab:MaelstromTab,
  };


}

export default CombatLogParser;
