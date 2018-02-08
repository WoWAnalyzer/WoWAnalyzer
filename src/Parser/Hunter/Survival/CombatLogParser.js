import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import Abilities from './Modules/Abilities';
import Channeling from './Modules/Helper/Channeling';

//Features
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import TimeFocusCapped from '../Shared/Modules/Features/TimeFocusCapped';
import FocusUsage from '../Shared/Modules/Features/FocusUsage';
import SixBiteWindows from './Modules/Features/MongooseFury/SixBiteWindows';
import SixStackBites from './Modules/Features/MongooseFury/SixStackBites';

//Tier
import Tier21_2p from './Modules/Items/Tier21_2p';
import Tier21_4p from './Modules/Items/Tier21_4p';
import Tier20_2p from './Modules/Items/Tier20_2p';
import Tier20_4p from './Modules/Items/Tier20_4p';
//Focus
import FocusTracker from '../Shared/Modules/Features/FocusChart/FocusTracker';
import FocusTab from '../Shared/Modules/Features/FocusChart/FocusTab';

//Items
import SoulOfTheHuntmaster from '../Shared/Modules/Items/SoulOfTheHuntmaster';
import RootsOfShaladrassil from '../Shared/Modules/Items/RootsOfShaladrassil';
import CallOfTheWild from '../Shared/Modules/Items/CallOfTheWild';
import TheApexPredatorsClaw from '../Shared/Modules/Items/TheApexPredatorsClaw';
import TheShadowHuntersVoodooMask from '../Shared/Modules/Items/TheShadowHuntersVoodooMask';
import UnseenPredatorsCloak from './Modules/Items/UnseenPredatorsCloak';
import HelbrineRopeOfTheMistMarauder from './Modules/Items/HelbrineRopeOfTheMistMarauder';
import NesingwarysTrappingTreads from './Modules/Items/NesingwarysTrappingTreads';
import ButchersBoneApron from './Modules/Items/ButchersBoneApron';
import FrizzosFingertrap from './Modules/Items/FrizzosFingertrap';

//Talents
import WayOfTheMokNathal from './Modules/Talents/WayOfTheMokNathal';
import SpittingCobra from './Modules/Talents/SpittingCobra';

//Traits

//Traits and Talents list

//Checklist

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core statistics
    damageDone: [DamageDone, { showStatistic: true }],
    abilities: Abilities,
    channeling: Channeling,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    timeFocusCapped: TimeFocusCapped,
    focusUsage: FocusUsage,
    sixBiteWindows: SixBiteWindows,
    sixStackBites: SixStackBites,

    //Focus Chart
    focusTracker: FocusTracker,
    focusTab: FocusTab,

    //Items
    tier20_2p: Tier20_2p,
    tier20_4p: Tier20_4p,
    tier21_2p: Tier21_2p,
    tier21_4p: Tier21_4p,
    soulOfTheHuntmaster: SoulOfTheHuntmaster,
    callOfTheWild: CallOfTheWild,
    rootsOfShaladrassil: RootsOfShaladrassil,
    theApexPredatorsClaw: TheApexPredatorsClaw,
    theShadowHuntersVoodooMask: TheShadowHuntersVoodooMask,
    unseenPredatorsCloak: UnseenPredatorsCloak,
    helbrineRopeOfTheMistMarauder: HelbrineRopeOfTheMistMarauder,
    nesingwarysTrappingTreads: NesingwarysTrappingTreads,
    butchersBoneApron: ButchersBoneApron,
    frizzosFingertrap: FrizzosFingertrap,

    //Talents
    wayOfTheMokNathal: WayOfTheMokNathal,
    spittingCobra: SpittingCobra,
    //Traits

    //Traits and Talents list

    //Checklist
  };
}

export default CombatLogParser;
