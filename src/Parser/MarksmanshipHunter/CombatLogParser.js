import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import FocusChart from './Modules/FocusChart/Focus';
import MaxFocus from './Modules/FocusChart/MaxFocus';
import PassiveFocusWasted from './Modules/FocusChart/PassiveFocusWasted';
import ActiveFocusWasted from './Modules/FocusChart/ActiveFocusWasted';

import CastEfficiency from './Modules/Features/CastEfficiency';

import CooldownTracker from './Modules/Features/CooldownTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import VulnerableUptime from './Modules/Features/VulnerableUptime';
import VulnerableTracker from './Modules/Features/AimedInVulnerableTracker';

import Tier20_2p from './Modules/Items/Tier20_2p';
import Tier20_4p from './Modules/Items/Tier20_4p';


class CombatLogParser extends CoreCombatLogParser {

  static specModules = {
    // Marksmanship Core
    damageDone: [DamageDone, { showStatistic: true }],

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    castEfficiency: CastEfficiency,
    cooldownTracker: CooldownTracker,
    vulnerabluptime: VulnerableUpTime,
    
    //Focus Chart
    maxFocus: MaxFocus,
    passiveFocusWasted: PassiveFocusWasted,
    activeFocusWasted: ActiveFocusWasted,
    vulnerableTracker: VulnerableTracker,
    vulnerableUptime: VulnerableUptime,

    //Items
    tier20_2p: Tier20_2p,
    tier20_4p: Tier20_4p,

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
	  {
        title: 'Focus Chart',
        url: 'focus',
        render: () => (
          <Tab title="focus" style={{ padding: '15px 22px' }}>
            <FocusChart
              reportCode={this.report.code}
              actorId={this.playerId}
              start={this.fight.start_time}
              end={this.fight.end_time}
              playerHaste={this.modules.combatants.selected.hasteRating}
              focusMax={this.modules.maxFocus._focus}
              passiveWaste={this.modules.passiveFocusWasted.cappedTimer}
              pwTracker={this.modules.passiveFocusWasted.tracker}
              activeWaste={this.modules.activeFocusWasted.events}
              aWTracker={this.modules.activeFocusWasted.tracker}
            />
          </Tab>
        ),
      },

      ...results.tabs,
    ];

    return results;
  }
}

export default CombatLogParser;
