import {
  Channeling,
  DeathTracker,
  NaturalMending,
  Trailblazer,
  Barrage,
  AMurderOfCrows,
  BornToBeWild,
  BindingShot,
  KillShot,
  FocusTracker,
  FocusDetails,
  SpellFocusCost,
  DeathChakrams,
  WailingArrow,
  WailingArrowPrepullNormalizer,
  TranquilizingShot,
  SteelTrap,
} from '../shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import GlobalCooldown from './modules/core/GlobalCooldown';
import SpellUsable from './modules/core/SpellUsable';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import DireCommand from './modules/talents/DireCommand';
import BasicAttacks from './modules/pets/BasicAttacksTracker';
import BeastMasteryFocusCapTracker from './modules/resources/BeastMasteryFocusCapTracker';
import BeastMasteryFocusUsage from './modules/resources/BeastMasteryFocusUsage';
import Focus from './modules/resources/Focus';
import BarbedShot from './modules/talents/BarbedShot';
import BeastCleave from './modules/talents/BeastCleave';
import BestialWrath from './modules/talents/BestialWrath';
import CobraShot from './modules/talents/CobraShot';
import AnimalCompanion from './modules/talents/AnimalCompanion';
import AspectOfTheBeast from './modules/talents/AspectOfTheBeast';
import DireBeast from './modules/talents/DireBeast';
import KillerCobra from './modules/talents/KillerCobra';
import KillerInstinct from './modules/talents/KillerInstinct';
import OneWithThePack from './modules/talents/OneWithThePack';
import ScentOfBlood from './modules/talents/ScentOfBlood';
import Stampede from './modules/talents/Stampede';
import Stomp from './modules/talents/Stomp';
import ThrillOfTheHunt from './modules/talents/ThrillOfTheHunt';
import MasterMarksman from '../shared/talents/MasterMarksman';
import DireCommandNormalizer from './normalizers/DireCommandNormalizer';
import Guide from './modules/guide/Guide';
import FrenzyBuffStackTracker from './modules/guide/sections/rotation/FrenzyBuffStackTracker';
import FrenzyBuffStackGraph from './modules/guide/sections/rotation/FrenzyBuffStackGraph';
import FocusGraph from './modules/guide/sections/resources/FocusGraph';
import BarbedShotNormalizer from './normalizers/BarbedShotNormalizer';
import Bloodshed from './modules/talents/Bloodshed';
import DirePack from './modules/talents/DirePack';
import T29BMTier2P from './modules/items/T29BMTier2P';
import T29BMTier4P from './modules/items/T29BMTier4P';
import CallToDominance from 'parser/retail/modules/items/dragonflight/CallToDominance';
import T30BMTier2P from './modules/items/T30BMTier2P';
import T30BMTier4P from './modules/items/T30BMTier4P';

class CombatLogParser extends CoreCombatLogParser {
  static guide = Guide;
  static specModules = {
    globalCooldown: GlobalCooldown,
    spellUsable: SpellUsable,
    checklist: Checklist,

    //Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    channeling: Channeling,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,

    //Guide
    frenzyBuffStackTracker: FrenzyBuffStackTracker,
    frenzyBuffStackGraph: FrenzyBuffStackGraph,
    focusGraph: FocusGraph,

    //Resources
    focusTracker: FocusTracker,
    focusDetails: FocusDetails,
    spellFocusCost: SpellFocusCost,
    beastMasteryFocusCapTracker: BeastMasteryFocusCapTracker,
    focus: Focus,
    beastMasteryFocusUsage: BeastMasteryFocusUsage,

    //Normalizers
    wailingArrowPrepullNormalizer: WailingArrowPrepullNormalizer,
    direCommandNormalizer: DireCommandNormalizer,
    barbedShotNormalizer: BarbedShotNormalizer,

    //DeathTracker
    deathTracker: DeathTracker,

    //Pets
    basicAttacks: BasicAttacks,

    //Spells
    bestialWrath: BestialWrath,
    beastCleave: BeastCleave,
    cobraShot: CobraShot,
    barbedShot: BarbedShot,
    killShot: KillShot,

    //Talents
    killerInstinct: KillerInstinct,
    direBeast: DireBeast,
    naturalMending: NaturalMending,
    trailblazer: Trailblazer,
    barrage: Barrage,
    killerCobra: KillerCobra,
    stampede: Stampede,
    stomp: Stomp,
    aMurderOfCrows: AMurderOfCrows,
    thrillOfTheHunt: ThrillOfTheHunt,
    oneWithThePack: OneWithThePack,
    aspectOfTheBeast: AspectOfTheBeast,
    scentOfBlood: ScentOfBlood,
    bornToBeWild: BornToBeWild,
    bindingShot: BindingShot,
    animalCompanion: AnimalCompanion,
    direCommand: DireCommand,
    wailingArrow: WailingArrow,
    deathChakrams: DeathChakrams,
    masterMarksman: MasterMarksman,
    bloodshed: Bloodshed,
    direPack: DirePack,
    tranquilizingShot: TranquilizingShot,
    steeltrap: SteelTrap,

    //Items
    t292p: T29BMTier2P,
    t294p: T29BMTier4P,
    t302p: T30BMTier2P,
    t304p: T30BMTier4P,
    callToDominance: CallToDominance,
  };
}

export default CombatLogParser;
