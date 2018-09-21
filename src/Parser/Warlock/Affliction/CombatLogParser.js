import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';

import AgonyUptime from './Modules/Features/DotUptimes/AgonyUptime';
import CorruptionUptime from './Modules/Features/DotUptimes/CorruptionUptime';
import UnstableAfflictionUptime from './Modules/Features/DotUptimes/UnstableAfflictionUptime';
import DotUptimes from './Modules/Features/DotUptimes';

import SoulShardTracker from './Modules/SoulShards/SoulShardTracker';
import SoulShardDetails from './Modules/SoulShards/SoulShardDetails';
import Channeling from './Modules/WarlockCore/Channeling';
import GlobalCooldown from './Modules/WarlockCore/GlobalCooldown';

import AbsoluteCorruption from './Modules/Talents/AbsoluteCorruption';
import SiphonLifeUptime from './Modules/Talents/SiphonLifeUptime';
import SoulConduit from './Modules/Talents/SoulConduit';
import Deathbolt from './Modules/Talents/Deathbolt';
import Haunt from './Modules/Talents/Haunt';
import DrainSoulSniping from './Modules/Talents/DrainSoulSniping';

import Checklist from './Modules/Features/Checklist/Module';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],
    checklist: Checklist,

    // DoTs
    agonyUptime: AgonyUptime,
    corruptionUptime: CorruptionUptime,
    unstableAfflictionUptime: UnstableAfflictionUptime,
    dotUptimes: DotUptimes,

    // Core
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,

    // Talents
    drainSoulSniping: DrainSoulSniping,
    deathbolt: Deathbolt,
    absoluteCorruption: AbsoluteCorruption,
    siphonLifeUptime: SiphonLifeUptime,
    soulConduit: SoulConduit,
    haunt: Haunt,
  };
}

export default CombatLogParser;
