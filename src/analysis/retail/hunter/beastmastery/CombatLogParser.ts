import {
  Channeling,
  DeathTracker,
  NaturalMending,
  Trailblazer,
  BornToBeWild,
  BindingShot,
  FocusTracker,
  FocusDetails,
  SpellFocusCost,
  TranquilizingShot,
  Deathblow,
} from '../shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import GlobalCooldown from './modules/core/GlobalCooldown';
import SpellUsable from './modules/core/SpellUsable';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import BasicAttacks from './modules/pets/BasicAttacksTracker';
import BeastMasteryFocusCapTracker from './modules/resources/BeastMasteryFocusCapTracker';
import BeastMasteryFocusUsage from './modules/resources/BeastMasteryFocusUsage';
import Focus from './modules/resources/Focus';
import BeastCleave from './modules/talents/BeastCleave';
import BestialWrath from './modules/talents/BestialWrath';
import CobraShot from './modules/talents/CobraShot';
import AnimalCompanion from './modules/talents/AnimalCompanion';
import AspectOfTheBeast from './modules/talents/AspectOfTheBeast';
import KillerCobra from './modules/talents/KillerCobra';
import ScentOfBlood from './modules/talents/ScentOfBlood';
import Stomp from './modules/talents/Stomp';
import ThrillOfTheHunt from './modules/talents/ThrillOfTheHunt';
import MasterMarksman from '../shared/talents/MasterMarksman';
import Guide from './modules/guide/Guide';
import FocusGraph from './modules/guide/sections/resources/FocusGraph';
import HunterEventLinkNormalizers from '../shared/normalizers/HunterEventLinkNormalizers';

class CombatLogParser extends CoreCombatLogParser {
  static guide = Guide;
  static specModules = {
    globalCooldown: GlobalCooldown,
    spellUsable: SpellUsable,

    //Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    channeling: Channeling,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,

    //Guide
    focusGraph: FocusGraph,

    //Resources
    focusTracker: FocusTracker,
    focusDetails: FocusDetails,
    spellFocusCost: SpellFocusCost,
    beastMasteryFocusCapTracker: BeastMasteryFocusCapTracker,
    focus: Focus,
    beastMasteryFocusUsage: BeastMasteryFocusUsage,

    //Normalizers
    hunterEventLinkNormalizer: HunterEventLinkNormalizers,

    //DeathTracker
    deathTracker: DeathTracker,

    //Pets
    basicAttacks: BasicAttacks,

    //Spells
    bestialWrath: BestialWrath,
    beastCleave: BeastCleave,
    cobraShot: CobraShot,

    //Talents
    naturalMending: NaturalMending,
    trailblazer: Trailblazer,
    killerCobra: KillerCobra,
    stomp: Stomp,
    thrillOfTheHunt: ThrillOfTheHunt,
    aspectOfTheBeast: AspectOfTheBeast,
    scentOfBlood: ScentOfBlood,
    bornToBeWild: BornToBeWild,
    bindingShot: BindingShot,
    animalCompanion: AnimalCompanion,
    masterMarksman: MasterMarksman,
    tranquilizingShot: TranquilizingShot,
    deathblow: Deathblow,

    //Items
  };
}

export default CombatLogParser;
