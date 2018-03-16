import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import Abilities from './Modules/Abilities';
import Channeling from './Modules/Helper/Channeling';
import SpellUsable from '../Shared/Modules/Core/SpellUsable';

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

//Spells
import ExplosiveTrap from './Modules/Spells/ExplosiveTrap';

//Talents
import WayOfTheMokNathal from './Modules/Talents/WayOfTheMokNathal';
import SpittingCobra from './Modules/Talents/SpittingCobra';
import Caltrops from './Modules/Talents/Caltrops';
import SteelTrap from './Modules/Talents/SteelTrap';
import AspectOfTheBeast from '../Shared/Modules/Talents/AspectOfTheBeast';
import SerpentSting from './Modules/Talents/SerpentSting';
import AMurderOfCrows from './Modules/Talents/AMurderOfCrows';
import DragonsfireGrenade from './Modules/Talents/DragonsfireGrenade';
import ThrowingAxes from './Modules/Talents/ThrowingAxes';
import ButcheryCarve from './Modules/Talents/ButcheryCarve';
import MortalWounds from './Modules/Talents/MortalWounds';

//Traits
import FuryOfTheEagle from './Modules/Traits/FuryOfTheEagle'; //artifact ability
import EaglesBite from './Modules/Traits/EaglesBite';
import TalonStrike from './Modules/Traits/TalonStrike';
import TalonBond from './Modules/Traits/TalonBond';
import EchoesOfOhnara from './Modules/Traits/EchoesOfOhnara';
import AspectOfTheSkylord from './Modules/Traits/AspectOfTheSkylord';
import Hellcarver from './Modules/Traits/Hellcarver';

//Traits and Talents list
import TraitsAndTalents from './Modules/Features/TraitsAndTalents';

//Checklist

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core statistics
    damageDone: [DamageDone, { showStatistic: true }],
    abilities: Abilities,
    channeling: Channeling,
    spellUsable: SpellUsable,

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

    //Spells
    explosiveTrap: ExplosiveTrap,

    //Talents
    wayOfTheMokNathal: WayOfTheMokNathal,
    spittingCobra: SpittingCobra,
    caltrops: Caltrops,
    steelTrap: SteelTrap,
    aspectOfTheBeast: AspectOfTheBeast,
    serpentSting: SerpentSting,
    aMurderOfCrows: AMurderOfCrows,
    dragonsfireGrenade: DragonsfireGrenade,
    throwingAxes: ThrowingAxes,
    butcheryCarve: ButcheryCarve,
    mortalWounds: MortalWounds,

    //Traits
    furyOfTheEagle: FuryOfTheEagle,
    eaglesBite: EaglesBite,
    talonStrike: TalonStrike,
    talonBond: TalonBond,
    echoesOfOhnara: EchoesOfOhnara,
    aspectOfTheSkylord: AspectOfTheSkylord,
    hellcarver: Hellcarver,

    //Traits and Talents list
    traitsAndTalents: TraitsAndTalents,

    //Checklist
  };
}

export default CombatLogParser;
