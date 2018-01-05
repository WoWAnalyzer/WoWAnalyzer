import React from 'react';

import Tab from 'Main/Tab';

import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import Abilities from './Modules/Abilities';
//Features
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import VulnerableUptime from './Modules/Features/VulnerableUptime';
import VulnerableTracker from './Modules/Features/AimedInVulnerableTracker';
import TimeFocusCapped from '../Shared/Modules/Features/TimeFocusCapped';
import VulnerableApplications from "./Modules/Features/VulnerableApplications";
import CancelledCasts from "../Shared/Modules/Features/CancelledCasts";
import FocusUsage from '../Shared/Modules/Features/FocusUsage';

//Tier
import Tier21_2p from './Modules/Items/Tier21_2p';
import Tier21_4p from './Modules/Items/Tier21_4p';
import Tier20_2p from './Modules/Items/Tier20_2p';
import Tier20_4p from './Modules/Items/Tier20_4p';
import Tier19_2p from "./Modules/Items/Tier19_2p";
//Spells
import Trueshot from './Modules/Spells/Trueshot';
//Focus
import FocusChart from '../Shared/Modules/Features/FocusChart/Focus';
import FocusTracker from '../Shared/Modules/Features/FocusChart/FocusTracker';
//Items
import UllrsFeatherSnowshoes from './Modules/Items/UllrsFeatherSnowshoes';
import SoulOfTheHuntmaster from '../Shared/Modules/Items/SoulOfTheHuntmaster';
import MKIIGyroscopicStabilizer from './Modules/Items/MKIIGyroscopicStabilizer';
import WarBeltOfTheSentinelArmy from "./Modules/Items/WarBeltOfTheSentinelArmy";
import TarnishedSentinelMedallion from "./Modules/Items/TarnishedSentinelMedallion";
import CelerityOfTheWindrunners from './Modules/Items/CelerityOfTheWindrunners';
import MagnetizedBlastingCapLauncher from './Modules/Items/MagnetizedBlastingCapLauncher';
import RootsOfShaladrassil from '../Shared/Modules/Items/RootsOfShaladrassil';
import CallOfTheWild from '../Shared/Modules/Items/CallOfTheWild';
import TheApexPredatorsClaw from '../Shared/Modules/Items/TheApexPredatorsClaw';
import TheShadowHuntersVoodooMask from '../Shared/Modules/Items/TheShadowHuntersVoodooMask';
import ZevrimsHunger from './Modules/Items/ZevrimsHunger';
//Talents
import LockAndLoad from './Modules/Talents/LockAndLoad';
import TrueAim from './Modules/Talents/TrueAim';
import PatientSniperTracker from './Modules/Talents/PatientSniper/PatientSniperTracker';
import PatientSniperDetails from "./Modules/Talents/PatientSniper/PatientSniperDetails";
import Volley from '../Shared/Modules/Talents/Volley';
import ExplosiveShot from "./Modules/Talents/ExplosiveShot";
import PiercingShot from "./Modules/Talents/PiercingShot";
import AMurderOfCrows from "./Modules/Talents/AMurderOfCrows";
import TrickShot from "./Modules/Talents/TrickShot/TrickShot";
import TrickShotCleave from "./Modules/Talents/TrickShot/TrickShotCleave";
import Barrage from '../Shared/Modules/Talents/Barrage';
import BlackArrow from './Modules/Talents/BlackArrow';
import Sidewinders from './Modules/Talents/Sidewinders';
import LoneWolf from './Modules/Talents/LoneWolf';
import CarefulAim from './Modules/Talents/CarefulAim';
//Traits
import QuickShot from './Modules/Traits/QuickShot';
import Bullseye from './Modules/Traits/Bullseye';
import CyclonicBurst from './Modules/Traits/CyclonicBurst';
import CallOfTheHunter from './Modules/Traits/CallOfTheHunter';
import LegacyOfTheWindrunners from './Modules/Traits/LegacyOfTheWindrunners';
//Traits and Talents list
import TraitsAndTalents from './Modules/Features/TraitsAndTalents';

//Checklist
import Checklist from './Modules/Features/Checklist';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core statistics
    damageDone: [DamageDone, { showStatistic: true }],
    abilities: Abilities,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    vulnerableUptime: VulnerableUptime,
    vulnerableTracker: VulnerableTracker,
    timeFocusCapped: TimeFocusCapped,
    vulnerableApplications: VulnerableApplications,
    cancelledCasts: CancelledCasts,
    focusUsage: FocusUsage,

    //Focus Chart
    focusTracker: FocusTracker,

    //Items
    tier19_2p: Tier19_2p,
    tier20_2p: Tier20_2p,
    tier20_4p: Tier20_4p,
    tier21_2p: Tier21_2p,
    tier21_4p: Tier21_4p,
    ullrsFeatherSnowshoes: UllrsFeatherSnowshoes,
    soulOfTheHuntmaster: SoulOfTheHuntmaster,
    mkiiGyroscopicStabilizer: MKIIGyroscopicStabilizer,
    warBeltOfTheSentinelArmy: WarBeltOfTheSentinelArmy,
    celerityOfTheWindrunners: CelerityOfTheWindrunners,
    magnetizedBlastingCapLauncher: MagnetizedBlastingCapLauncher,
    zevrimsHunger: ZevrimsHunger,
    callOfTheWild: CallOfTheWild,
    rootsOfShaladrassil: RootsOfShaladrassil,
    theApexPredatorsClaw: TheApexPredatorsClaw,
    theShadowHuntersVoodooMask: TheShadowHuntersVoodooMask,

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
    trickShotCleave: TrickShotCleave,
    barrage: Barrage,
    blackArrow: BlackArrow,
    sidewinders: Sidewinders,
    loneWolf: LoneWolf,
    carefulAim: CarefulAim,

    //Traits
    quickShot: QuickShot,
    bullseye: Bullseye,
    cyclonicBurst: CyclonicBurst,
    callOfTheHunter: CallOfTheHunter,
    legacyOfTheWindrunners: LegacyOfTheWindrunners,

    //Traits and Talents list
    traitsAndTalents: TraitsAndTalents,

    //Checklist
    checklist: Checklist,
  };

  generateResults() {
    const results = super.generateResults();
    results.tabs = [
      ...results.tabs,
      { // TODO: Move this to an Analyzer module
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
    ];

    return results;
  }
}

export default CombatLogParser;
