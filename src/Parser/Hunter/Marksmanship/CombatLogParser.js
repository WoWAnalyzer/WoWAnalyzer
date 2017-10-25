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
import VulnerableApplications from "./Modules/Features/VulnerableApplications";

//Focus
import FocusChart from './Modules/FocusChart/Focus';
import FocusTracker from './Modules/FocusChart/FocusTracker';

//Tier
import Tier20_2p from './Modules/Items/Tier20_2p';
import Tier20_4p from './Modules/Items/Tier20_4p';
import Tier19_2p from "./Modules/Items/Tier19_2p";

//Spells
import Trueshot from './Modules/Spells/Trueshot';

//Items
import UllrsFeatherSnowshoes from './Modules/Items/UllrsFeatherSnowshoes';
import SoulOfTheHuntmaster from '../Shared/Items/SoulOfTheHuntmaster';
import MKIIGyroscopicStabilizer from './Modules/Items/MKIIGyroscopicStabilizer';
import WarBeltOfTheSentinelArmy from "./Modules/Items/WarBeltOfTheSentinelArmy";
import TarnishedSentinelMedallion from "./Modules/Items/TarnishedSentinelMedallion";

//Talents
import LockAndLoad from './Modules/Talents/LockAndLoad';
import TrueAim from './Modules/Talents/TrueAim';
import PatientSniperTracker from './Modules/Talents/PatientSniper/PatientSniperTracker';
import PatientSniperDetails from "./Modules/Talents/PatientSniper/PatientSniperDetails";
import Volley from './Modules/Talents/Volley';

//Traits
import QuickShot from './Modules/Traits/QuickShot';
import ExplosiveShot from "./Modules/Talents/ExplosiveShot";
import PiercingShot from "./Modules/Talents/PiercingShot";
import AMurderOfCrows from "./Modules/Talents/AMurderOfCrows";
import TrickShot from "./Modules/Talents/TrickShot";

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
    vulnerableApplications: VulnerableApplications,

    //Focus Chart
    focusTracker: FocusTracker,

    //Items
    tier19_2P: Tier19_2p,
    tier20_2p: Tier20_2p,
    tier20_4p: Tier20_4p,
    ullrsFeatherSnowshoes: UllrsFeatherSnowshoes,
    soulOfTheHuntmaster: SoulOfTheHuntmaster,
    mkiiGyroscopicStabilizer: MKIIGyroscopicStabilizer,
    warBeltOfTheSentinelArmy: WarBeltOfTheSentinelArmy,

    //Spells
    trueshot: Trueshot,
    tarnishedSentinelMedallion: TarnishedSentinelMedallion,

    //Talents
    patientSniperTracker: PatientSniperTracker,
    patientSniperDetails: PatientSniperDetails,
    lockAndLoad: LockAndLoad,
    trueAim: TrueAim,
    volley: Volley,
    explosiveShot: ExplosiveShot,
    piercingShot: PiercingShot,
    aMurderOfCrows: AMurderOfCrows,
    trickShot: TrickShot,

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
