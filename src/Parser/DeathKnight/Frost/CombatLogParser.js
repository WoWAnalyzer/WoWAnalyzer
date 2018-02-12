import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';

import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import FrostFeverUptime from './Modules/Features/FrostFeverUptime';
import WastedRimeProcs from './Modules/Features/WastedRimeProcs';
import HardHowlingBlastCasts from './Modules/Features/HardHowlingBlastCasts';

import Tier20_2p from './Modules/Items/Tier20_2p';
import Tier21_2p from './Modules/Items/Tier21_2p';
import Tier21_4p from './Modules/Items/Tier21_4p';

import ColdHeart from '../Shared/Items/ColdHeart';
import RuneTracker from '../Shared/RuneTracker';

import GatheringStorm from './Modules/Talents/GatheringStorm';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    damageDone: [DamageDone, { showStatistic: true }],
    cooldownThroughputTracker: CooldownThroughputTracker,


    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    HardHowlingBlastCasts: HardHowlingBlastCasts,

    // DOT
    frostfeverUptime: FrostFeverUptime,

    // PROCS
    WastedRimeProcs: WastedRimeProcs,

    //Items
    coldHeart: ColdHeart,
    tier20_2p: Tier20_2p,
    tier21_2p: Tier21_2p,
    tier21_4p: Tier21_4p,

    //rune tracker
    runeTracker: RuneTracker,

    //talents
    gatheringStorm: GatheringStorm,
  };
}

export default CombatLogParser;
