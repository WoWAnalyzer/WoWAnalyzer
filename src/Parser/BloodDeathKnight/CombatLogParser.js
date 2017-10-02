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
import BlooddrinkerTicks from './Modules/Features/BlooddrinkerTicks';

import RunicPowerDetails from './Modules/RunicPower/RunicPowerDetails';
import RunicPowerTracker from './Modules/RunicPower/RunicPowerTracker';

import IceboundFortitude from './Modules/Core/IceboundFortitude';
import VampiricBlood from './Modules/Core/VampiricBlood';
import BloodMirror from './Modules/Core/BloodMirror';

import T20_2pc from './Modules/Items/T20_2pc';
import T20_4pc from './Modules/Items/T20_4pc';


class CombatLogParser extends CoreCombatLogParser {
  static specModules = {

    // DeathKnight Core

    // Features
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,
    boneShieldUptime: BoneShieldUptime,
    ossuaryUptime: OssuaryUptime,
    wastedDeathAndDecay: WastedDeathAndDecay,
    blooddrinkerTicks: BlooddrinkerTicks,
    vampiricBlood: VampiricBlood,
    iceboundFortitude: IceboundFortitude,
    bloodMirror: BloodMirror,


    // DOT
    bloodplagueUptime: BloodPlagueUptime,

    // RunicPower
    runicPowerTracker: RunicPowerTracker,
    runicPowerDetails: RunicPowerDetails,

    // Talents


    // Traits


    // Items:
    t20_2pc: T20_2pc,
    t20_4pc: T20_4pc,
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
