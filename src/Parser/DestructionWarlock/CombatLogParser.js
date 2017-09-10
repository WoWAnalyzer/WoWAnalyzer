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
import DimensionalRift from './Modules/Features/DimensionalRift';

import ReverseEntropy from './Modules/Talents/ReverseEntropy';
import Eradication from './Modules/Talents/Eradication';
import EradicationTalent from './Modules/Talents/EradicationTalent';
import EmpoweredLifeTap from './Modules/Talents/EmpoweredLifeTap';

import SoulShardEvents from './Modules/SoulShards/SoulShardEvents';
import SoulShardTracker from './Modules/SoulShards/SoulShardTracker';
import SoulShardDetails from './Modules/SoulShards/SoulShardDetails';
import DamageDone from './Modules/Features/DamageDone';

import Backdraft from './Modules/Talents/Backdraft';
import RoaringBlaze from './Modules/Talents/RoaringBlaze';
import Shadowburn from './Modules/Talents/Shadowburn';
import SoulHarvest from './Modules/Talents/SoulHarvest';
import SoulHarvestTalent from './Modules/Talents/SoulHarvestTalent';

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
    soulShardEvents: SoulShardEvents,
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,

    //Talents
    reverseEntropy: ReverseEntropy,
    eradication: Eradication,
    eradicationTalent: EradicationTalent,
    empoweredLifeTap: EmpoweredLifeTap,
    backdraft: Backdraft,
    roaringBlaze: RoaringBlaze,
    shadowburn: Shadowburn,
    soulHarvest: SoulHarvest,
    soulHarvestTalent: SoulHarvestTalent,

    //Legendaries
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
