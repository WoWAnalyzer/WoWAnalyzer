import {
  Channeling,
  DeathTracker,
  NaturalMending,
  BornToBeWild,
  BindingShot,
  FocusTracker,
  FocusDetails,
  SpellFocusCost,
  TranquilizingShot,
  Deathblow,
  CancelledCasts,
} from '../shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
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
import MasterMarksman from '../shared/talents/MasterMarksman';
import Guide from './modules/guide/Guide';
import FocusGraph from './modules/guide/sections/resources/FocusGraph';
import HunterEventLinkNormalizers from '../shared/normalizers/HunterEventLinkNormalizers';
import DireCommand from './modules/talents/DireCommand';
import DireBeast from './modules/talents/DireBeast';
import DarkHound from './modules/talents/DarkHound';
import WarOrders from './modules/talents/WarOrders';
import BarbedScales from './modules/talents/BarbedScales';
import DireCommandNormalizer from './normalizers/DireCommandNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static guide = Guide;
  static specModules = {
    //Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cancelledCasts: CancelledCasts,
    channeling: Channeling,
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
    direCommandNormalizer: DireCommandNormalizer,
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
    animalCompanion: AnimalCompanion,
    aspectOfTheBeast: AspectOfTheBeast,
    barbedScales: BarbedScales,
    bindingShot: BindingShot,
    bornToBeWild: BornToBeWild,
    darkHound: DarkHound,
    deathblow: Deathblow,
    direBeast: DireBeast,
    direCommand: DireCommand,
    killerCobra: KillerCobra,
    masterMarksman: MasterMarksman,
    naturalMending: NaturalMending,
    scentOfBlood: ScentOfBlood,
    stomp: Stomp,
    tranquilizingShot: TranquilizingShot,
    warOrders: WarOrders,

    //Items
  };
}

export default CombatLogParser;
