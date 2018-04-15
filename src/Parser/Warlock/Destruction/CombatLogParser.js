import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import DoomguardInfernal from './Modules/Features/DoomguardInfernal';
import UnusedLordOfFlames from './Modules/Features/UnusedLordOfFlames';
import ImmolateUptime from './Modules/Features/ImmolateUptime';
import Havoc from './Modules/Features/Havoc';
import DimensionalRift from './Modules/Features/DimensionalRift';


import SoulShardEvents from './Modules/SoulShards/SoulShardEvents';
import SoulShardTracker from './Modules/SoulShards/SoulShardTracker';
import SoulShardDetails from './Modules/SoulShards/SoulShardDetails';

import Backdraft from './Modules/Talents/Backdraft';
import RoaringBlaze from './Modules/Talents/RoaringBlaze';
import Shadowburn from './Modules/Talents/Shadowburn';
import ReverseEntropy from './Modules/Talents/ReverseEntropy';
import Eradication from './Modules/Talents/Eradication';
import EmpoweredLifeTap from './Modules/Talents/EmpoweredLifeTap';
import FireAndBrimstone from './Modules/Talents/FireAndBrimstone';
import SoulHarvest from '../Shared/Modules/Talents/SoulHarvest';
import SoulHarvestTalent from './Modules/Talents/SoulHarvestTalent';
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
    doomguardInfernal: DoomguardInfernal,
    unusedLordOfFlames: UnusedLordOfFlames,
    dimensionalRift: DimensionalRift,

    // DoTs
    immolateUptime: ImmolateUptime,

    // Core
    havoc: Havoc,
    soulShardEvents: SoulShardEvents,
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,

    // Talents
    backdraft: Backdraft,
    roaringBlaze: RoaringBlaze,
    shadowburn: Shadowburn,
    reverseEntropy: ReverseEntropy,
    eradication: Eradication,
    empoweredLifeTap: EmpoweredLifeTap,
    fireAndBrimstone: FireAndBrimstone,
    soulHarvest: SoulHarvest,
    soulHarvestTalent: SoulHarvestTalent,
    channelDemonfire: ChannelDemonfire,
    soulConduit: SoulConduit,
    talentHub: TalentHub,
  };
}

export default CombatLogParser;
