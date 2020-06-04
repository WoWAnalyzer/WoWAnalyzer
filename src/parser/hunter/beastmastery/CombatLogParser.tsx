import CoreCombatLogParser from 'parser/core/CombatLogParser';
import GlobalCooldown from './modules/core/GlobalCooldown';
import SpellUsable from './modules/core/SpellUsable';
import Checklist from './modules/checklist/Module';

//Features
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import FocusUsage from '../shared/modules/resources/FocusUsage';

//Death Tracker
import DeathTracker from '../shared/modules/core/DeathTracker';

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

//Pets
import BasicAttacks from './modules/pets/basicAttacksTracker';

//Spells
import BeastCleave from './modules/spells/BeastCleave';
import CobraShot from './modules/spells/CobraShot';
import BarbedShot from './modules/spells/BarbedShot';
import AspectOfTheWild from './modules/spells/AspectOfTheWild';
import BestialWrath from './modules/spells/BestialWrath';

//Focus
import FocusTracker from '../shared/modules/resources/FocusTracker';
import FocusDetails from '../shared/modules/resources/FocusDetails';
import SpellFocusCost from '../shared/modules/resources/SpellFocusCost';
import BeastMasteryFocusCapTracker from './modules/core/BeastMasteryFocusCapTracker';
import Focus from './modules/core/Focus';

//Azerite Traits
import DanceOfDeath from './modules/spells/azeritetraits/DanceOfDeath';
import HazeOfRage from './modules/spells/azeritetraits/HazeOfRage';
import FeedingFrenzy from './modules/spells/azeritetraits/FeedingFrenzy';
import PrimalInstincts from './modules/spells/azeritetraits/PrimalInstincts';
import DireConsequences from '../shared/modules/spells/azeritetraits/DireConsequences';
import RapidReload from '../shared/modules/spells/azeritetraits/RapidReload';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    globalCooldown: GlobalCooldown,
    spellUsable: SpellUsable,
    checklist: Checklist,

    //Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    focusUsage: FocusUsage,

    //Resources
    focusTracker: FocusTracker,
    focusDetails: FocusDetails,
    spellFocusCost: SpellFocusCost,
    beastMasteryFocusCapTracker: BeastMasteryFocusCapTracker,
    focus: Focus,

    //DeathTracker
    deathTracker: DeathTracker,

    //Pets
    basicAttacks: BasicAttacks,

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

    //Azerite Traits
    danceOfDeath: DanceOfDeath,
    hazeOfRage: HazeOfRage,
    feedingFrenzy: FeedingFrenzy,
    primalInstincts: PrimalInstincts,
    direConsequences: DireConsequences,
    rapidReload: RapidReload,
  };
}

export default CombatLogParser;
