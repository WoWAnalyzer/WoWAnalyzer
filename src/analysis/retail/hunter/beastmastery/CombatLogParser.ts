import {
  Channeling,
  DeathTracker,
  NaturalMending,
  Trailblazer,
  Barrage,
  BornToBeWild,
  BindingShot,
  KillShot,
  FocusTracker,
  FocusDetails,
  SpellFocusCost,
  TranquilizingShot,
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
import ScentOfBlood from './modules/talents/ScentOfBlood';
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
    stomp: Stomp,
    thrillOfTheHunt: ThrillOfTheHunt,
    aspectOfTheBeast: AspectOfTheBeast,
    scentOfBlood: ScentOfBlood,
    bornToBeWild: BornToBeWild,
    bindingShot: BindingShot,
    animalCompanion: AnimalCompanion,
    direCommand: DireCommand,
    masterMarksman: MasterMarksman,
    bloodshed: Bloodshed,
    tranquilizingShot: TranquilizingShot,

    //Items
  };
}

export default CombatLogParser;
