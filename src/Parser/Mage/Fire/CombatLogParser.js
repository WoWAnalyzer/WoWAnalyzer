import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import FlamestrikeNormalizer from './Normalizers/Flamestrike';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import Abilities from './Modules/Features/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import CancelledCasts from '../Shared/Modules/Features/CancelledCasts';

import MirrorImage from '../Shared/Modules/Features/MirrorImage';
import UnstableMagic from '../Shared/Modules/Features/UnstableMagic';
import Kindling from './Modules/Features/Kindling';
import PhoenixsFlames from './Modules/Features/PhoenixsFlames';
import HotStreak from './Modules/Features/HotStreak';
import Combustion from './Modules/Features/Combustion';

import Tier20_4set from './Modules/Items/Tier20_4set';
import ShardOfTheExodar from '../Shared/Modules/Items/ShardOfTheExodar';
import SoulOfTheArchmage from './Modules/Items/SoulOfTheArchmage';
import DarcklisDragonfireDiadem from './Modules/Items/DarcklisDragonfireDiadem';
import ContainedInfernalCore from './Modules/Items/ContainedInfernalCore';
import PyrotexIgnitionCloth from './Modules/Items/PyrotexIgnitionCloth';


class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    //Normalizers
    FlameStrikeNormalizer: FlamestrikeNormalizer,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],
    cancelledCasts: CancelledCasts,
    phoenixsFlames: PhoenixsFlames,
    hotStreak: HotStreak,
    combustion: Combustion,

    // Talents
    mirrorImage: MirrorImage,
    unstableMagic: UnstableMagic,
    kindling: Kindling,

	  //Items
	  tier20_4set: Tier20_4set,
    shardOfTheExodar: ShardOfTheExodar,
    soulOfTheArchmage: SoulOfTheArchmage,
    darcklisDragonfireDiadem: DarcklisDragonfireDiadem,
    containedInfernalCore: ContainedInfernalCore,
    pyrotexIgnitionCloth: PyrotexIgnitionCloth,

  };
}

export default CombatLogParser;
