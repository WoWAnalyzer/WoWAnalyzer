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

import CoreCombatLogParser from 'parser/core/CombatLogParser';

//Overridden Core modules
import SpellUsable from './modules/core/SpellUsable';
import GlobalCooldown from './modules/core/GlobalCooldown';

//Features
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';

//Checklist
import Checklist from './modules/checklist/Module';

//Talents
import KillerInstinct from './modules/talents/KillerInstinct';
import ChimaeraShot from './modules/talents/ChimaeraShot';
import DireBeast from './modules/talents/DireBeast';
import KillerCobra from './modules/talents/KillerCobra';
import Stampede from './modules/talents/Stampede';
import Stomp from './modules/talents/Stomp';
import ThrillOfTheHunt from './modules/talents/ThrillOfTheHunt';
import OneWithThePack from './modules/talents/OneWithThePack';
import AspectOfTheBeast from './modules/talents/AspectOfTheBeast';
import SpittingCobra from './modules/talents/SpittingCobra';
import ScentOfBlood from './modules/talents/ScentOfBlood';
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
import BeastMasteryFocusCapTracker from './modules/resources/BeastMasteryFocusCapTracker';
import Focus from './modules/resources/Focus';
import BeastMasteryFocusUsage from './modules/resources/BeastMasteryFocusUsage';

//Conduits
import Bloodletting from './modules/spells/conduits/Bloodletting';
import EchoingCall from './modules/spells/conduits/EchoingCall';
import FerociousAppetite from './modules/spells/conduits/FerociousAppetite';
import OneWithTheBeast from './modules/spells/conduits/OneWithTheBeast';

//Legendaries
import DireCommand from './modules/items/DireCommand';
import FlamewakersCobraSting from './modules/items/FlamewakersCobraSting';
import QaplaEredunWarOrder from './modules/items/QaplaEredunWarOrder';
import RylakstalkersPiercingFangs from './modules/items/RylakstalkersPiercingFangs';
import NesingwarysTrappingApparatus from './modules/items/NesingwarysTrappingApparatus';

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
