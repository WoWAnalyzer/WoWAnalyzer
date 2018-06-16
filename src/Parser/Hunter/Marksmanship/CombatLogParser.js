import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import Abilities from './Modules/Abilities';

//Features
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import TimeFocusCapped from '../Shared/Modules/Features/TimeFocusCapped';
import CancelledCasts from "../Shared/Modules/Features/CancelledCasts";
import FocusUsage from '../Shared/Modules/Features/FocusUsage';
//Tier
import Tier21_2p from './Modules/Items/Tier21_2p';
import Tier20_2p from './Modules/Items/Tier20_2p';
import Tier20_4p from './Modules/Items/Tier20_4p';
import Tier19_2p from "./Modules/Items/Tier19_2p";
//Spells
import Trueshot from './Modules/Spells/Trueshot';

//Focus
import FocusTracker from '../Shared/Modules/Features/FocusChart/FocusTracker';
import FocusTab from '../Shared/Modules/Features/FocusChart/FocusTab';
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




class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core statistics
    damageDone: [DamageDone, { showStatistic: true }],
    abilities: Abilities,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    timeFocusCapped: TimeFocusCapped,
    cancelledCasts: CancelledCasts,
    focusUsage: FocusUsage,

    //Focus Chart
    focusTracker: FocusTracker,
    focusTab: FocusTab,

    //Items
    tier19_2p: Tier19_2p,
    tier20_2p: Tier20_2p,
    tier20_4p: Tier20_4p,
    tier21_2p: Tier21_2p,
    // t21 is broken because it says marked shot which is gone for MM in BFA
    //tier21_4p: Tier21_4p,
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
    tarnishedSentinelMedallion: TarnishedSentinelMedallion,

    //Spells
    trueshot: Trueshot,
  };
}

export default CombatLogParser;
