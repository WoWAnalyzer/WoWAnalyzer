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
import SoulHarvest from './Modules/Talents/SoulHarvest';
import SoulHarvestTalent from './Modules/Talents/SoulHarvestTalent';
import ChannelDemonfire from './Modules/Talents/ChannelDemonfire';
import TalentHub from './Modules/Talents/TalentHub';

import AlythesssPyrogenics from './Modules/Items/Legendaries/AlythesssPyrogenics';
import FeretoryOfSouls from './Modules/Items/Legendaries/FeretoryOfSouls';
import LessonsOfSpaceTime from './Modules/Items/Legendaries/LessonsOfSpaceTime';
import SindoreiSpite from './Modules/Items/Legendaries/SindoreiSpite';
import MagistrikeRestraints from './Modules/Items/Legendaries/MagistrikeRestraints';
import OdrShawlOfTheYmirjar from './Modules/Items/Legendaries/OdrShawlOfTheYmirjar';
import SoulOfTheNetherlord from './Modules/Items/Legendaries/SoulOfTheNetherlord';
import TheMasterHarvester from './Modules/Items/Legendaries/TheMasterHarvester';

import T20_2set from './Modules/Items/T20_2set';

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
    talentHub: TalentHub,

    // Legendaries
    alythesssPyrogenics: AlythesssPyrogenics,
    feretoryOfSouls: FeretoryOfSouls,
    lessonsOfSpaceTime: LessonsOfSpaceTime,
    sindoreiSpite: SindoreiSpite,
    magistrikeRestraints: MagistrikeRestraints,
    odrShawlOfTheYmirjar: OdrShawlOfTheYmirjar,
    soulOfTheNetherlord: SoulOfTheNetherlord,
    masterHarvester: TheMasterHarvester,

    // Items
    t20_2set: T20_2set,
  };
}

export default CombatLogParser;
