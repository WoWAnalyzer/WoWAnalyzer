import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/core/modules/DamageDone';

import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import ImmolateUptime from './modules/features/ImmolateUptime';
import Havoc from './modules/features/Havoc';

import SoulShardTracker from './modules/soulshards/SoulShardTracker';
import SoulShardDetails from './modules/soulshards/SoulShardDetails';

import Backdraft from './modules/features/Backdraft';
import Eradication from './modules/talents/Eradication';
import FireAndBrimstone from './modules/talents/FireAndBrimstone';
import ChannelDemonfire from './modules/talents/ChannelDemonfire';
import SoulConduit from './modules/talents/SoulConduit';
import TalentHub from './modules/talents/TalentHub';

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
