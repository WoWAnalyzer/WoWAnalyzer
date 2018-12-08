import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';
import GlobalCooldown from './modules/core/GlobalCooldown';
import SpellUsable from './modules/core/SpellUsable';
import Checklist from './modules/checklist/Module';

//Features
import Abilities from './modules/Abilities';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import FocusUsage from '../shared/modules/features/FocusUsage';
import TimeFocusCapped from '../shared/modules/features/TimeFocusCapped';

//Talents
import KillerInstinct from './modules/talents/KillerInstinct';
import NaturalMending from '../shared/modules/talents/NaturalMending';
import Trailblazer from '../shared/modules/talents/Trailblazer';
import Barrage from '../shared/modules/talents/Barrage';
import ChimaeraShot from './modules/talents/ChimaeraShot';
import DireBeast from './modules/talents/DireBeast';
import KillerCobra from './modules/talents/KillerCobra';
import Stampede from './modules/talents/Stampede';
import Stomp from './modules/talents/Stomp';
import AMurderOfCrows from '../shared/modules/talents/AMurderOfCrows';
import ThrillOfTheHunt from './modules/talents/ThrillOfTheHunt';
import VenomousBite from './modules/talents/VenomousBite';
import OneWithThePack from './modules/talents/OneWithThePack';
import AspectOfTheBeast from './modules/talents/AspectOfTheBeast';
import SpittingCobra from './modules/talents/SpittingCobra';
import ScentOfBlood from './modules/talents/ScentOfBlood';
import BornToBeWild from '../shared/modules/talents/BornToBeWild';
import BindingShot from '../shared/modules/talents/BindingShot';
import AnimalCompanion from './modules/talents/AnimalCompanion';

//Spells
import BeastCleave from './modules/spells/BeastCleave';
import CobraShot from './modules/spells/CobraShot';
import BarbedShot from './modules/spells/BarbedShot';
import AspectOfTheWild from './modules/spells/AspectOfTheWild';
import BestialWrath from './modules/spells/BestialWrath';

//Focus
import FocusTracker from '../shared/modules/features/focuschart/FocusTracker';
import FocusTab from '../shared/modules/features/focuschart/FocusTab';

//Traits and talents
import SpellsAndTalents from './modules/features/SpellsAndTalents';

//Azerite Traits
import DanceOfDeath from './modules/spells/azeritetraits/DanceOfDeath';
import HazeOfRage from './modules/spells/azeritetraits/HazeOfRage';
import FeedingFrenzy from './modules/spells/azeritetraits/FeedingFrenzy';
import PrimalInstincts from './modules/spells/azeritetraits/PrimalInstincts';
import PackAlpha from './modules/spells/azeritetraits/PackAlpha';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    damageDone: [DamageDone, { showStatistic: true }],
    globalCooldown: GlobalCooldown,
    spellUsable: SpellUsable,
    checklist: Checklist,

    //Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    focusUsage: FocusUsage,
    timeFocusCapped: TimeFocusCapped,

    //Focus Chart
    focusTracker: FocusTracker,
    focusTab: FocusTab,

    //Spells
    bestialWrath: BestialWrath,
    beastCleave: BeastCleave,
    cobraShot: CobraShot,
    barbedShot: BarbedShot,
    aspectOfTheWild: AspectOfTheWild,

    //Talents
    killerInstinct: KillerInstinct,
    chimaeraShot: ChimaeraShot,
    direBeast: DireBeast,
    naturalMending: NaturalMending,
    trailblazer: Trailblazer,
    barrage: Barrage,
    killerCobra: KillerCobra,
    stampede: Stampede,
    stomp: Stomp,
    aMurderOfCrows: AMurderOfCrows,
    venomousBite: VenomousBite,
    thrillOfTheHunt: ThrillOfTheHunt,
    oneWithThePack: OneWithThePack,
    aspectOfTheBeast: AspectOfTheBeast,
    spittingCobra: SpittingCobra,
    scentOfBlood: ScentOfBlood,
    bornToBeWild: BornToBeWild,
    bindingShot: BindingShot,
    animalCompanion: AnimalCompanion,
    
    //Traits and talents
    spellssAndTalents: SpellsAndTalents,

    //Azerite Traits
    danceOfDeath: DanceOfDeath,
    hazeOfRage: HazeOfRage,
    feedingFrenzy: FeedingFrenzy,
    primalInstincts: PrimalInstincts,
    packAlpha: PackAlpha,
  };
}

export default CombatLogParser;
