import CoreCombatLogParser from 'parser/core/CombatLogParser';

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
  ResonatingArrow,
  DeathChakrams,
  WildSpirits,
  FlayedShot,
  EnfeebledMark,
  EmpoweredRelease,
  NecroticBarrage,
  SpiritAttunement,
  MarkmansAdvantage,
  ResilienceOfTheHunter,
  ReversalOfFortune,
  RejuvenatingWind,
  HarmonyOfTheTortollan,
  SoulforgeEmbers,
} from '@wowanalyzer/hunter';

//Overridden Core modules
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import GlobalCooldown from './modules/core/GlobalCooldown';
import SpellUsable from './modules/core/SpellUsable';

//Features
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';

//Checklist

//Talents
import DireCommand from './modules/items/DireCommand';
import FlamewakersCobraSting from './modules/items/FlamewakersCobraSting';
import NesingwarysTrappingApparatus from './modules/items/NesingwarysTrappingApparatus';
import QaplaEredunWarOrder from './modules/items/QaplaEredunWarOrder';
import RylakstalkersPiercingFangs from './modules/items/RylakstalkersPiercingFangs';
import BasicAttacks from './modules/pets/basicAttacksTracker';
import BeastMasteryFocusCapTracker from './modules/resources/BeastMasteryFocusCapTracker';
import BeastMasteryFocusUsage from './modules/resources/BeastMasteryFocusUsage';
import Focus from './modules/resources/Focus';
import AspectOfTheWild from './modules/spells/AspectOfTheWild';
import BarbedShot from './modules/spells/BarbedShot';
import BeastCleave from './modules/spells/BeastCleave';
import BestialWrath from './modules/spells/BestialWrath';
import CobraShot from './modules/spells/CobraShot';
import Bloodletting from './modules/spells/conduits/Bloodletting';
import EchoingCall from './modules/spells/conduits/EchoingCall';
import FerociousAppetite from './modules/spells/conduits/FerociousAppetite';
import OneWithTheBeast from './modules/spells/conduits/OneWithTheBeast';
import AnimalCompanion from './modules/talents/AnimalCompanion';
import AspectOfTheBeast from './modules/talents/AspectOfTheBeast';
import ChimaeraShot from './modules/talents/ChimaeraShot';
import DireBeast from './modules/talents/DireBeast';
import KillerCobra from './modules/talents/KillerCobra';
import KillerInstinct from './modules/talents/KillerInstinct';
import OneWithThePack from './modules/talents/OneWithThePack';
import ScentOfBlood from './modules/talents/ScentOfBlood';
import SpittingCobra from './modules/talents/SpittingCobra';
import Stampede from './modules/talents/Stampede';
import Stomp from './modules/talents/Stomp';
import ThrillOfTheHunt from './modules/talents/ThrillOfTheHunt';

//Pets

//Spells

//Focus

//Conduits

//Legendaries

class CombatLogParser extends CoreCombatLogParser {
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

    //Resources
    focusTracker: FocusTracker,
    focusDetails: FocusDetails,
    spellFocusCost: SpellFocusCost,
    beastMasteryFocusCapTracker: BeastMasteryFocusCapTracker,
    focus: Focus,
    beastMasteryFocusUsage: BeastMasteryFocusUsage,

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
    killShot: KillShot,

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
    thrillOfTheHunt: ThrillOfTheHunt,
    oneWithThePack: OneWithThePack,
    aspectOfTheBeast: AspectOfTheBeast,
    spittingCobra: SpittingCobra,
    scentOfBlood: ScentOfBlood,
    bornToBeWild: BornToBeWild,
    bindingShot: BindingShot,
    animalCompanion: AnimalCompanion,

    //Covenants
    resonatingArrow: ResonatingArrow,
    deathChakrams: DeathChakrams,
    wildSpirits: WildSpirits,
    flayedShot: FlayedShot,

    //Conduits
    empoweredRelease: EmpoweredRelease,
    enfeebledMark: EnfeebledMark,
    necroticBarrage: NecroticBarrage,
    spiritAttunement: SpiritAttunement,
    bloodLetting: Bloodletting,
    echoingCall: EchoingCall,
    ferociousAppetite: FerociousAppetite,
    oneWithTheBeast: OneWithTheBeast,
    markmansAdvantage: MarkmansAdvantage,
    resilienceOfTheHunter: ResilienceOfTheHunter,
    reversalOfFortune: ReversalOfFortune,
    rejuvenatingWind: RejuvenatingWind,
    harmonyOfTheTortollan: HarmonyOfTheTortollan,

    //Generic Legendaries
    nesingwarysTrappingApparatus: NesingwarysTrappingApparatus,
    soulforgeEmbers: SoulforgeEmbers,

    //Beast Mastery Legendaries
    direCommand: DireCommand,
    flamewakersCobraSting: FlamewakersCobraSting,
    qaplaEredunWarOrder: QaplaEredunWarOrder,
    rylakstalkersPiercingFangs: RylakstalkersPiercingFangs,
  };
}

export default CombatLogParser;
