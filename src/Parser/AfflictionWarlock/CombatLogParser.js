import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';

import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';
import AgonyUptime from './Modules/Features/AgonyUptime';
import CorruptionUptime from "./Modules/Features/CorruptionUptime";
import SiphonLifeUptime from "./Modules/Features/SiphonLifeUptime";

import SoulShardTracker from "./Modules/SoulShards/SoulShardTracker";
import SoulShardDetails from "./Modules/SoulShards/SoulShardDetails";

class CombatLogParser extends MainCombatLogParser {

  static specModules = {
    // Features
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,

    // DoT uptimes
    agonyUptime: AgonyUptime,
    corruptionUptime: CorruptionUptime,
    siphonLifeUptime: SiphonLifeUptime,

    //Core
    soulShardTracker: SoulShardTracker,
    soulShardDetails: SoulShardDetails,
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
          <Tab title="Talents">
            <Talents combatant={this.selectedCombatant} />
          </Tab>
        ),
      },
      // {
      //   title: 'Mana',
      //   url: 'mana',
      //   render: () => (
      //     <Tab title="Mana" style={{ padding: '15px 22px' }}>
      //       <Mana
      //         reportCode={this.report.code}
      //         actorId={this.playerId}
      //         start={this.fight.start_time}
      //         end={this.fight.end_time}
      //       />
      //     </Tab>
      //   ),
      // },
      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
