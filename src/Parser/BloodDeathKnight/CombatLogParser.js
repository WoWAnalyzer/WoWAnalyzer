import React from 'react';
import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';
import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';
import BloodPlagueUptime from './Modules/Features/BloodPlagueUptime';
import BoneShieldUptime from './Modules/Features/BoneShieldUptime';
import OssuaryUptime from './Modules/Features/OssuaryUptime';
import WastedDeathAndDecay from './Modules/Features/WastedDeathAndDecay';
import RPWasted from './Modules/Features/RunicPowerWasted';
import BlooddrinkerTicks from './Modules/Features/BlooddrinkerTicks';

class CombatLogParser extends CoreCombatLogParser {

  static specModules = {

    //DeathKnight Core

    // Features
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
    BoneShieldUptime: BoneShieldUptime,
    OssuaryUptime: OssuaryUptime,
    WastedDeathAndDecay: WastedDeathAndDecay,
    RunicPowerWasted: RPWasted,
    BlooddrinkerTicks: BlooddrinkerTicks,

    //DOT
    bloodplagueUptime: BloodPlagueUptime,
    // Talents


    // Traits


    // Items:

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
