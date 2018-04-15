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

//Focus
import FocusTracker from '../Shared/Modules/Features/FocusChart/FocusTracker';
import FocusTab from '../Shared/Modules/Features/FocusChart/FocusTab';

//Spells
import ExplosiveTrap from './Modules/Spells/ExplosiveTrap';
import Lacerate from './Modules/Spells/Lacerate';
import AspectOfTheEagle from './Modules/Spells/AspectOfTheEagle';

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

    //Spells
    explosiveTrap: ExplosiveTrap,
    lacerate: Lacerate,
    aspectOfTheEagle: AspectOfTheEagle,

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
