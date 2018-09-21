import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';

import AgonyUptime from './Modules/Features/AgonyUptime';
import CorruptionUptime from './Modules/Features/CorruptionUptime';
import UnstableAfflictionUptime from './Modules/Features/UnstableAfflictionUptime';

import SoulShardTracker from './Modules/SoulShards/SoulShardTracker';
import SoulShardDetails from './Modules/SoulShards/SoulShardDetails';
import Channeling from './Modules/WarlockCore/Channeling';
import GlobalCooldown from './Modules/WarlockCore/GlobalCooldown';
import Sniping from './Modules/Features/Sniping';

import AbsoluteCorruption from './Modules/Talents/AbsoluteCorruption';
import SiphonLifeUptime from './Modules/Talents/SiphonLifeUptime';
import SoulConduit from './Modules/Talents/SoulConduit';
import Deathbolt from './Modules/Talents/Deathbolt';
import Haunt from './Modules/Talents/Haunt';

import Checklist from './Modules/Features/Checklist/Module';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],
    sniping: Sniping,
    checklist: Checklist,

    // DoTs
    agonyUptime: AgonyUptime,
    corruptionUptime: CorruptionUptime,
    unstableAfflictionUptime: UnstableAfflictionUptime,

    // Core
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
    channeling: Channeling,
    globalCooldown: GlobalCooldown,

    // Talents
    absoluteCorruption: AbsoluteCorruption,
    siphonLifeUptime: SiphonLifeUptime,
    soulConduit: SoulConduit,
    deathbolt: Deathbolt,
    haunt: Haunt,
  };
}

export default CombatLogParser;
