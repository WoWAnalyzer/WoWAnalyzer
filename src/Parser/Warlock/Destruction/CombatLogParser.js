import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Features/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import ImmolateUptime from './Modules/Features/ImmolateUptime';
import Havoc from './Modules/Features/Havoc';


import SoulShardEvents from './Modules/SoulShards/SoulShardEvents';
import SoulShardTracker from './Modules/SoulShards/SoulShardTracker';
import SoulShardDetails from './Modules/SoulShards/SoulShardDetails';

import Backdraft from './Modules/Features/Backdraft';
import Shadowburn from './Modules/Talents/Shadowburn';
import Eradication from './Modules/Talents/Eradication';
import FireAndBrimstone from './Modules/Talents/FireAndBrimstone';
import ChannelDemonfire from './Modules/Talents/ChannelDemonfire';
import SoulConduit from './Modules/Talents/SoulConduit';
import TalentHub from './Modules/Talents/TalentHub';

import AlythesssPyrogenics from './Modules/Items/Legendaries/AlythesssPyrogenics';
import FeretoryOfSouls from './Modules/Items/Legendaries/FeretoryOfSouls';
import SindoreiSpite from '../Shared/Modules/Items/SindoreiSpite';
import MagistrikeRestraints from './Modules/Items/Legendaries/MagistrikeRestraints';
import OdrShawlOfTheYmirjar from './Modules/Items/Legendaries/OdrShawlOfTheYmirjar';
import SoulOfTheNetherlord from './Modules/Items/Legendaries/SoulOfTheNetherlord';
import TheMasterHarvester from '../Shared/Modules/Items/TheMasterHarvester';

import T20_2set from './Modules/Items/T20_2set';
import T21_2set from './Modules/Items/T21_2set';
import T21_4set from './Modules/Items/T21_4set';

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
    soulShardEvents: SoulShardEvents,
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,

    // Talents
    backdraft: Backdraft,
    shadowburn: Shadowburn,
    eradication: Eradication,
    fireAndBrimstone: FireAndBrimstone,
    channelDemonfire: ChannelDemonfire,
    soulConduit: SoulConduit,
    talentHub: TalentHub,

    // Legendaries
    alythesssPyrogenics: AlythesssPyrogenics,
    feretoryOfSouls: FeretoryOfSouls,
    sindoreiSpite: SindoreiSpite,
    magistrikeRestraints: MagistrikeRestraints,
    odrShawlOfTheYmirjar: OdrShawlOfTheYmirjar,
    soulOfTheNetherlord: SoulOfTheNetherlord,
    masterHarvester: TheMasterHarvester,

    // Items
    t20_2set: T20_2set,
    t21_2set: T21_2set,
    t21_4set: T21_4set,
  };
}

export default CombatLogParser;
