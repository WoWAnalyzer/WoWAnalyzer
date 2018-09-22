import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import ImmolateUptime from './Modules/Features/ImmolateUptime';
import Havoc from './Modules/Features/Havoc';

import SoulShardTracker from './Modules/SoulShards/SoulShardTracker';
import SoulShardDetails from './Modules/SoulShards/SoulShardDetails';

import Backdraft from './Modules/Features/Backdraft';
import Eradication from './Modules/Talents/Eradication';
import FireAndBrimstone from './Modules/Talents/FireAndBrimstone';
import ChannelDemonfire from './Modules/Talents/ChannelDemonfire';
import SoulConduit from './Modules/Talents/SoulConduit';
import TalentHub from './Modules/Talents/TalentHub';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    damageDone: [DamageDone, { showStatistic: true }],

    // DoTs
    immolateUptime: ImmolateUptime,

    // Core
    havoc: Havoc,
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,

    // Talents
    backdraft: Backdraft,
    eradication: Eradication,
    fireAndBrimstone: FireAndBrimstone,
    channelDemonfire: ChannelDemonfire,
    soulConduit: SoulConduit,
    talentHub: TalentHub,
  };
}

export default CombatLogParser;
