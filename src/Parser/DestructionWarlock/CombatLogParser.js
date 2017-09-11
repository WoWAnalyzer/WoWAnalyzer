import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';
import DoomguardInfernal from './Modules/Features/DoomguardInfernal';
import UnusedLordOfFlames from './Modules/Features/UnusedLordOfFlames';
import GrimoireOfService from './Modules/Features/GrimoireOfService';
import ImmolateUptime from './Modules/Features/ImmolateUptime';
import Havoc from './Modules/Features/Havoc';
import DamageDone from './Modules/Features/DamageDone';
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

import LessonsOfSpaceTime from './Modules/Items/Legendaries/LessonsOfSpaceTime';
import MagistrikeRestraints from './Modules/Items/Legendaries/MagistrikeRestraints';
import OdrShawlOfTheYmirjar from './Modules/Items/Legendaries/OdrShawlOfTheYmirjar';
import FeretoryOfSouls from './Modules/Items/Legendaries/FeretoryOfSouls';
import SoulOfTheNetherlord from './Modules/Items/Legendaries/SoulOfTheNetherlord';
import TheMasterHarvester from './Modules/Items/Legendaries/TheMasterHarvester';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
    damageDone: DamageDone,
    doomguardInfernal: DoomguardInfernal,
    unusedLordOfFlames: UnusedLordOfFlames,
    grimoireOfService: GrimoireOfService,
    dimensionalRift: DimensionalRift,

    // DoTs
    immolateUptime: ImmolateUptime,

    //Core
    havoc: Havoc,
    soulShardEvents: SoulShardEvents,
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,

    //Talents
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

    //Legendaries
    lessonsOfSpaceTime: LessonsOfSpaceTime,
    magistrikeRestraints: MagistrikeRestraints,
    odrShawlOfTheYmirjar: OdrShawlOfTheYmirjar,
    feretoryOfSouls: FeretoryOfSouls,
    soulOfTheNetherlord: SoulOfTheNetherlord,
    masterHarvester: TheMasterHarvester,

    //Items
  };

  generateResults() {
    const results = super.generateResults();
    results.tabs = [
      {
        title: 'Suggestions',
        url: 'suggestions',
        render: () => (
          <SuggestionsTab issues={results.issues} />
        ),
      },
      {
        title: 'Talents',
        url: 'talents',
        render: () => (
          <Tab title='Talents'>
            <Talents combatant={this.modules.combatants.selected} />
          </Tab>
        ),
      },
      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
