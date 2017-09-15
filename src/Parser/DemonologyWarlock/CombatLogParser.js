import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';
import DoomguardInfernal from './Modules/Features/DoomguardInfernal';
import GrimoireOfService from './Modules/Features/GrimoireOfService';

import SoulShardTracker from './Modules/SoulShards/SoulShardTracker';
import SoulShardDetails from './Modules/SoulShards/SoulShardDetails';
import DamageDone from './Modules/Features/DamageDone';

import SoulHarvest from './Modules/Talents/SoulHarvest';
import SoulHarvestTalent from './Modules/Talents/SoulHarvestTalent';

import TheMasterHarvester from './Modules/Items/Legendaries/TheMasterHarvester';
import SoulOfTheNetherlord from './Modules/Items/Legendaries/SoulOfTheNetherlord';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Features
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
    damageDone: DamageDone,
    doomguardInfernal: DoomguardInfernal,
    grimoireOfService: GrimoireOfService,
    // DoTs

    //Core
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,

    //Talents
    soulHarvest: SoulHarvest,
    soulHarvestTalent: SoulHarvestTalent,

    //Legendaries
    masterHarvester: TheMasterHarvester,
    soulOfTheNetherlord: SoulOfTheNetherlord,

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
