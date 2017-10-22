import React from 'react';

import SuggestionsTab from 'Main/SuggestionsTab';
import Tab from 'Main/Tab';
import Talents from 'Main/Talents';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

//Features
import CastEfficiency from './Modules/Features/CastEfficiency';
import CooldownTracker from './Modules/Features/CooldownTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import VulnerableUptime from './Modules/Features/VulnerableUptime';
import VulnerableTracker from './Modules/Features/AimedInVulnerableTracker';
import TimeFocusCapped from './Modules/Features/TimeFocusCapped';

//Focus
import FocusChart from './Modules/FocusChart/Focus';
import FocusTracker from './Modules/FocusChart/FocusTracker';

//Tier
import Tier20_2p from './Modules/Items/Tier20_2p';
import Tier20_4p from './Modules/Items/Tier20_4p';
import Tier19_2p from './Modules/Items/Tier19_2p';

//Spells
import Trueshot from './Modules/Spells/Trueshot';

//Items
import UllrsFeatherSnowshoes from './Modules/Items/UllrsFeatherSnowshoes';

//Talents
import LockAndLoad from './Modules/Talents/LockAndLoad';
import TrueAim from './Modules/Talents/TrueAim';
import PatientSniperTracker from './Modules/Talents/PatientSniper/PatientSniperTracker';
import PatientSniperDetails from "./Modules/Talents/PatientSniper/PatientSniperDetails";

//Traits
import QuickShot from './Modules/Traits/QuickShot';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core statistics
    damageDone: [DamageDone, { showStatistic: true }],

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    castEfficiency: CastEfficiency,
    cooldownTracker: CooldownTracker,
    vulnerableUptime: VulnerableUptime,
    vulnerableTracker: VulnerableTracker,
    TimeFocusCapped: TimeFocusCapped,

    //Focus Chart
    focusTracker: FocusTracker,

    //Items
    tier19_2P: Tier19_2p,
    tier20_2p: Tier20_2p,
    tier20_4p: Tier20_4p,
    ullrsFeatherSnowshoes: UllrsFeatherSnowshoes,

    //Spells
    trueshot: Trueshot,

    //Talents
    patientSniperTracker: PatientSniperTracker,
    patientSniperDetails: PatientSniperDetails,
    lockAndLoad: LockAndLoad,
    trueAim: TrueAim,

    //Traits
    quickShot: QuickShot,
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
      {
        title: 'Focus Chart',
        url: 'focus',
        render: () => (
          <Tab title='focus' style={{ padding: '15px 22px' }}>
            <FocusChart
              start={this.fight.start_time}
              end={this.fight.end_time}
              playerHaste={this.modules.combatants.selected.hasteRating}
              focusMax={this.modules.focusTracker._maxFocus}
              focusPerSecond={this.modules.focusTracker.focusBySecond}
              tracker={this.modules.focusTracker.tracker}
              secondsCapped={this.modules.focusTracker.secondsCapped}
              activeFocusGenerated={this.modules.focusTracker.activeFocusGenerated}
              activeFocusWasted={this.modules.focusTracker.activeFocusWasted}
              generatorCasts={this.modules.focusTracker.generatorCasts}
              activeFocusWastedTimeline={this.modules.focusTracker.activeFocusWastedTimeline}
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
