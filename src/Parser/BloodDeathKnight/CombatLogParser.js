import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';
import Mana from 'Main/Mana';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';

import CastEfficiency from './Modules/Features/CastEfficiency';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';
import BloodPlagueUptime from './Modules/Features/BloodPlagueUptime';
import BoneShieldUptime from './Modules/Features/BoneShieldUptime';
import OssuaryUptime from './Modules/Features/OssuaryUptime';
import WastedDeathAndDecay from './Modules/Features/WastedDeathAndDecay';
import RPWasted from './Modules/Features/RunicPowerWasted';


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

    //DOT
    bloodplagueUptime: BloodPlagueUptime,
    // Talents


    // Traits


    // Items:

  };

  generateResults() {
    const results = super.generateResults();

    // TODO: Suggestion for Devo when it didn't prevent enough damage to be worthwhile
    // TODO: Suggestion for mana
    // TODO: Suggestion for enchants
    // TODO: Sanctified Wrath healing contribution

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
      {
        title: 'Mana',
        url: 'mana',
        render: () => (
          <Tab title="Mana" style={{ padding: '15px 22px' }}>
            <Mana parser={this} />
          </Tab>
        ),
      },
      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
