import React from 'react';

import { Boss, findByBossId } from 'raids';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import DeathRecapTracker from 'interface/others/DeathRecapTracker';
import ModuleError from 'parser/core/ModuleError';
import { CombatantInfoEvent, Event, HasSource, HasTarget } from 'parser/core/Events';
import Module from './Module';
import Fight from './Fight';
import Analyzer from './Analyzer';
import EventFilter from './EventFilter';
import { EventListener } from './EventSubscriber';
import { Builds } from '../Config';
// Normalizers
import ApplyBuffNormalizer from '../shared/normalizers/ApplyBuff';
import CancelledCastsNormalizer from '../shared/normalizers/CancelledCasts';
import PrePullCooldownsNormalizer from '../shared/normalizers/PrePullCooldowns';
import FightEndNormalizer from '../shared/normalizers/FightEnd';
import PhaseChangesNormalizer from '../shared/normalizers/PhaseChanges';
import MissingCastsNormalizer from '../shared/normalizers/MissingCasts';
// Enhancers
import SpellTimeWaitingOnGlobalCooldown from '../shared/enhancers/SpellTimeWaitingOnGlobalCooldown';
// Core modules
import HealingDone from '../shared/modules/throughput/HealingDone';
import DamageDone from '../shared/modules/throughput/DamageDone';
import DamageTaken from '../shared/modules/throughput/DamageTaken';
import ThroughputStatisticGroup from '../shared/modules/throughput/ThroughputStatisticGroup';
import DeathTracker from '../shared/modules/DeathTracker';

import Combatants from '../shared/modules/Combatants';
import AbilityTracker from '../shared/modules/AbilityTracker';
import Haste from '../shared/modules/Haste';
import StatTracker from '../shared/modules/StatTracker';
import AlwaysBeCasting from '../shared/modules/AlwaysBeCasting';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import AbilitiesMissing from '../shared/modules/AbilitiesMissing';
import CastEfficiency from '../shared/modules/CastEfficiency';
import SpellUsable from '../shared/modules/SpellUsable';
import EventHistory from '../shared/modules/EventHistory';
import SpellHistory from '../shared/modules/SpellHistory';
import GlobalCooldown from '../shared/modules/GlobalCooldown';
import Enemies from '../shared/modules/Enemies';
import EnemyInstances from '../shared/modules/EnemyInstances';
import Pets from '../shared/modules/Pets';
import ManaValues from '../shared/modules/ManaValues';
import SpellManaCost from '../shared/modules/SpellManaCost';
import Channeling from '../shared/modules/Channeling';
import DeathDowntime from '../shared/modules/downtime/DeathDowntime';
import TotalDowntime from '../shared/modules/downtime/TotalDowntime';
import DistanceMoved from '../shared/modules/others/DistanceMoved';
import DispelTracker from '../shared/modules/DispelTracker';
// Tabs
import RaidHealthTab from '../shared/modules/features/RaidHealthTab';

import CritEffectBonus from '../shared/modules/helpers/CritEffectBonus';

import PrePotion from '../shared/modules/items/PrePotion';
import EnchantChecker from '../shared/modules/items/EnchantChecker';
import FlaskChecker from '../shared/modules/items/FlaskChecker';
import FoodChecker from '../shared/modules/items/FoodChecker';
import Healthstone from '../shared/modules/items/Healthstone';
import HealthPotion from '../shared/modules/items/HealthPotion';
import CombatPotion from '../shared/modules/items/CombatPotion';
import PreparationRuleAnalyzer from '../shared/modules/features/Checklist/PreparationRuleAnalyzer';
// Racials
import ArcaneTorrent from '../shared/modules/racials/bloodelf/ArcaneTorrent';
import GiftOfTheNaaru from '../shared/modules/racials/draenei/GiftOfTheNaaru';
import MightOfTheMountain from '../shared/modules/racials/dwarf/MightOfTheMountain';
import Stoneform from '../shared/modules/racials/dwarf/Stoneform';
import Berserking from '../shared/modules/racials/troll/Berserking';
import BloodFury from '../shared/modules/racials/orc/BloodFury';
// Shared Buffs
import VantusRune from '../shared/modules/spells/VantusRune';
// BFA
import GildedLoaFigurine from '../shared/modules/items/bfa/GildedLoaFigurine';
import FirstMatesSpyglass from '../shared/modules/items/bfa/FirstMatesSpyglass';
import SeaGiantsTidestone from '../shared/modules/items/bfa/SeaGiantsTidestone';
import AncientKnotOfWisdom from '../shared/modules/items/bfa/AncientKnotOfWisdom';
// Dungeons
import SubroutineRecalibration from '../shared/modules/items/bfa/dungeons/SubroutineRecalibration';
import CyclotronicBlast from '../shared/modules/items/bfa/dungeons/CyclotronicBlast';
import MydasTalisman from '../shared/modules/items/bfa/dungeons/MydasTalisman';
import RevitalizingVoodooTotem from '../shared/modules/items/bfa/dungeons/RevitalizingVoodooTotem';
import LingeringSporepods from '../shared/modules/items/bfa/dungeons/LingeringSporepods';
import FangsOfIntertwinedEssence from '../shared/modules/items/bfa/dungeons/FangsOfIntertwinedEssence';
import BalefireBranch from '../shared/modules/items/bfa/dungeons/BalefireBranch';
import ConchofDarkWhispers from '../shared/modules/items/bfa/dungeons/ConchofDarkWhispers';
import Seabreeze from '../shared/modules/items/bfa/dungeons/Seabreeze';
import GalecallersBoon from '../shared/modules/items/bfa/dungeons/GalecallersBoon';
import HarlansLoadedDice from '../shared/modules/items/bfa/dungeons/HarlansLoadedDice';
import LustrousGoldenPlumage from '../shared/modules/items/bfa/dungeons/LustrousGoldenPlumage';
import RezansGleamingEye from '../shared/modules/items/bfa/dungeons/RezansGleamingEye';
import RotcrustedVoodooDoll from '../shared/modules/items/bfa/dungeons/RotcrustedVoodooDoll';
import AzerokksResonatingHeart from '../shared/modules/items/bfa/dungeons/AzerokksResonatingHeart';
import VesselOfSkitteringShadows from '../shared/modules/items/bfa/dungeons/VesselOfSkitteringShadows';
import LadyWaycrestsMusicBox from '../shared/modules/items/bfa/dungeons/LadyWaycrestsMusicBox';
import IgnitionMagesFuse from '../shared/modules/items/bfa/dungeons/IgnitionMagesFuse';
// PVP
import DreadGladiatorsMedallion from '../shared/modules/items/bfa/pvp/DreadGladiatorsMedallion';
import DreadGladiatorsInsignia from '../shared/modules/items/bfa/pvp/DreadGladiatorsInsignia';
import DreadGladiatorsBadge from '../shared/modules/items/bfa/pvp/DreadGladiatorsBadge';
//Enchants
import DeadlyNavigation from '../shared/modules/items/bfa/enchants/DeadlyNavigation';
import MasterfulNavigation from '../shared/modules/items/bfa/enchants/MasterfulNavigation';
import QuickNavigation from '../shared/modules/items/bfa/enchants/QuickNavigation';
import StalwartNavigation from '../shared/modules/items/bfa/enchants/StalwartNavigation';
import VersatileNavigation from '../shared/modules/items/bfa/enchants/VersatileNavigation';
import ForceMultiplier from '../shared/modules/items/bfa/enchants/ForceMultiplier';
import CoastalSurge from '../shared/modules/items/bfa/enchants/CoastalSurge';
// Crafted
import DarkmoonDeckTides from '../shared/modules/items/bfa/crafted/DarkmoonDeckTides';
import DarkmoonDeckFathoms from '../shared/modules/items/bfa/crafted/DarkmoonDeckFathoms';
import DarkmoonDeckBlockades from '../shared/modules/items/bfa/crafted/DarkmoonDeckBlockades';
import AlchemistStone from '../shared/modules/items/bfa/crafted/AlchemistStone';
// Azerite Traits
import Gemhide from '../shared/modules/spells/bfa/azeritetraits/Gemhide';
import CrystallineCarapace from '../shared/modules/spells/bfa/azeritetraits/CrystallineCarapace';
import Gutripper from '../shared/modules/spells/bfa/azeritetraits/Gutripper';
import HeedMyCall from '../shared/modules/spells/bfa/azeritetraits/HeedMyCall';
import LaserMatrix from '../shared/modules/spells/bfa/azeritetraits/LaserMatrix';
import MeticulousScheming from '../shared/modules/spells/bfa/azeritetraits/MeticulousScheming';
import OverwhelmingPower from '../shared/modules/spells/bfa/azeritetraits/OverwhelmingPower';
import ElementalWhirl from '../shared/modules/spells/bfa/azeritetraits/ElementalWhirl';
import BloodRite from '../shared/modules/spells/bfa/azeritetraits/BloodRite';
import BondedSouls from '../shared/modules/spells/bfa/azeritetraits/BondedSouls';
import ConcentratedMending from '../shared/modules/spells/bfa/azeritetraits/ConcentratedMending';
import BlessedPortents from '../shared/modules/spells/bfa/azeritetraits/BlessedPortents';
import TidalSurge from '../shared/modules/spells/bfa/azeritetraits/TidalSurge';
import BlightborneInfusion from '../shared/modules/spells/bfa/azeritetraits/BlightborneInfusion';
import ArchiveOfTheTitans from '../shared/modules/spells/bfa/azeritetraits/ArchiveOfTheTitans';
import Savior from '../shared/modules/spells/bfa/azeritetraits/Savior';
import WoundBinder from '../shared/modules/spells/bfa/azeritetraits/WoundBinder';
import SynergisticGrowth from '../shared/modules/spells/bfa/azeritetraits/SynergisticGrowth';
import BracingChill from '../shared/modules/spells/bfa/azeritetraits/BracingChill';
import EphemeralRecovery from '../shared/modules/spells/bfa/azeritetraits/EphemeralRecovery';
import UnstableCatalyst from '../shared/modules/spells/bfa/azeritetraits/UnstableCatalyst';
import SwirlingSands from '../shared/modules/spells/bfa/azeritetraits/SwirlingSands';
import Tradewinds from '../shared/modules/spells/bfa/azeritetraits/Tradewinds';
import TreacherousCovenant from '../shared/modules/spells/bfa/azeritetraits/TreacherousCovenant';
import LoyalToTheEnd from '../shared/modules/spells/bfa/azeritetraits/LoyalToTheEnd';
// Essences
import TheEverRisingTide from '../shared/modules/spells/bfa/essences/TheEverRisingTide';
import TheWellOfExistence from '../shared/modules/spells/bfa/essences/TheWellOfExistence';
import TheCrucibleofFlame from '../shared/modules/spells/bfa/essences/TheCrucibleofFlame';
import WorldveinResonance from '../shared/modules/spells/bfa/essences/WorldveinResonance';
import NullDynamo from '../shared/modules/spells/bfa/essences/NullDynamo';
import BloodOfTheEnemy from '../shared/modules/spells/bfa/essences/BloodOfTheEnemy';
import Strife from '../shared/modules/spells/bfa/essences/Strife';
import TheFormlessVoid from '../shared/modules/spells/bfa/essences/TheFormlessVoid';
import EssenceOfTheFocusingIris from '../shared/modules/spells/bfa/essences/EssenceOfTheFocusingIris';

// Uldir
import TwitchingTentacleofXalzaix from '../shared/modules/items/bfa/raids/uldir/TwitchingTentacleofXalzaix';
import VigilantsBloodshaper from '../shared/modules/items/bfa/raids/uldir/VigilantsBloodshaper';
import InoculatingExtract from '../shared/modules/items/bfa/raids/uldir/InoculatingExtract';
import FreneticCorpuscle from '../shared/modules/items/bfa/raids/uldir/FreneticCorpuscle';
import ConstructOvercharger from '../shared/modules/items/bfa/raids/uldir/ConstructOvercharger';
import SyringeOfBloodborneInfirmity from '../shared/modules/items/bfa/raids/uldir/SyringeOfBloodborneInfirmity';
import DiscOfSystematicRegression from '../shared/modules/items/bfa/raids/uldir/DiscOfSystematicRegression';
// BoD
import DiamondLacedReflectingPrism from '../shared/modules/items/bfa/raids/bod/DiamondLacedReflectingPrism';
import WardOfEnvelopment from '../shared/modules/items/bfa/raids/bod/WardOfEnvelopment';
import CrestOfPaku from '../shared/modules/items/bfa/raids/bod/CrestOfPaku';
import IncandescentSliver from '../shared/modules/items/bfa/raids/bod/IncandescentSliver';
// Crucible of Storms
import AbyssalSpeakersGauntlets from '../shared/modules/items/bfa/raids/crucibleofstorms/AbyssalSpeakersGauntlets';
import FathuulsFloodguards from '../shared/modules/items/bfa/raids/crucibleofstorms/FathuulsFloodguards';
import FathomDredgers from '../shared/modules/items/bfa/raids/crucibleofstorms/FathomDredgers';
import GripsOfForsakenSanity from '../shared/modules/items/bfa/raids/crucibleofstorms/GripsOfForsakenSanity';
import HarbingersInscrutableWill from '../shared/modules/items/bfa/raids/crucibleofstorms/HarbingersInscrutableWill';
import IdolOfIndiscriminateConsumption from '../shared/modules/items/bfa/raids/crucibleofstorms/IdolOfIndiscriminateConsumption';
import LeggingsOfTheAberrantTidesage from '../shared/modules/items/bfa/raids/crucibleofstorms/LeggingsOfTheAberrantTidesage';
import LegplatesOfUnboundAnguish from '../shared/modules/items/bfa/raids/crucibleofstorms/LegplatesOfUnboundAnguish';
import LurkersInsidiousGift from '../shared/modules/items/bfa/raids/crucibleofstorms/LurkersInsidiousGift';
import MalformedHeraldsLegwraps from '../shared/modules/items/bfa/raids/crucibleofstorms/MalformedHeraldsLegwraps';
import StormglideSteps from '../shared/modules/items/bfa/raids/crucibleofstorms/StormglideSteps';
import TridentOfDeepOcean from '../shared/modules/items/bfa/raids/crucibleofstorms/TridentOfDeepOcean';
import VoidStone from '../shared/modules/items/bfa/raids/crucibleofstorms/VoidStone';
import ZaxasjsDeepstriders from '../shared/modules/items/bfa/raids/crucibleofstorms/ZaxasjsDeepstriders';
// Azsharas Eternal Palace
import AshvanesRazorCoral from '../shared/modules/items/bfa/raids/azsharaseternalpalace/AshvanesRazorCoral';
import BloodthirstyUrchin from '../shared/modules/items/bfa/raids/azsharaseternalpalace/BloodthirstyUrchin';
import DribblingInkpod from '../shared/modules/items/bfa/raids/azsharaseternalpalace/DribblingInkpod';
import AzsharasFontofPower from '../shared/modules/items/bfa/raids/azsharaseternalpalace/AzsharasFontofPower';
// Nyalotha
import VitaChargedTitanshard from '../shared/modules/items/bfa/raids/nyalothathewakingcity/VitaChargedTitanshard';
import VoidTwistedTitanshard from '../shared/modules/items/bfa/raids/nyalothathewakingcity/VoidTwistedTitanshard';
import TitanicEmpowerment from '../shared/modules/items/bfa/raids/nyalothathewakingcity/TitanicEmpowerment';
import ForbiddenObsidianClaw from '../shared/modules/items/bfa/raids/nyalothathewakingcity/ForbiddenObsidianClaw';
import HummingBlackDragonscale from '../shared/modules/items/bfa/raids/nyalothathewakingcity/HummingBlackDragonscale';
// Corruptions
import IneffableTruth from '../shared/modules/spells/bfa/corruptions/IneffableTruth';
import HonedMind from '../shared/modules/spells/bfa/corruptions/HonedMind';
import SurgingVitality from '../shared/modules/spells/bfa/corruptions/SurgingVitality';
import RacingPulse from '../shared/modules/spells/bfa/corruptions/RacingPulse';
import DeadlyMomentum from '../shared/modules/spells/bfa/corruptions/DeadlyMomentum';
import VoidRitual from '../shared/modules/spells/bfa/corruptions/VoidRitual';
import Siphoner from '../shared/modules/spells/bfa/corruptions/Siphoner';
import FlashOfInsight from '../shared/modules/spells/bfa/corruptions/FlashOfInsight';
import Versatile from '../shared/modules/spells/bfa/corruptions/Versatile';
import Severe from '../shared/modules/spells/bfa/corruptions/Severe';
import Masterful from '../shared/modules/spells/bfa/corruptions/Masterful';
import Expedient from '../shared/modules/spells/bfa/corruptions/Expedient';

// Legendaries
import Ashjrakamas from '../shared/modules/items/bfa/Ashjrakamas';

import ParseResults from './ParseResults';
import EventsNormalizer from './EventsNormalizer';
import EventEmitter from './modules/EventEmitter';
// This prints to console anything that the DI has to do
const debugDependencyInjection = false;
const MAX_DI_ITERATIONS = 100;
const isMinified = process.env.NODE_ENV === 'production';

type DependencyDefinition = typeof Module | readonly [typeof Module, {[option: string]: any}];
export type DependenciesDefinition = {[desiredName: string]: DependencyDefinition};
class CombatLogParser {
  static abilitiesAffectedByHealingIncreases: Array<number> = [];
  static abilitiesAffectedByDamageIncreases: Array<number> = [];

  static internalModules: DependenciesDefinition = {
    fightEndNormalizer: FightEndNormalizer,
    eventEmitter: EventEmitter,
    combatants: Combatants,
    deathDowntime: DeathDowntime,
    totalDowntime: TotalDowntime,
  };
  static defaultModules: DependenciesDefinition = {
    // Normalizers
    applyBuffNormalizer: ApplyBuffNormalizer,
    cancelledCastsNormalizer: CancelledCastsNormalizer,
    prepullNormalizer: PrePullCooldownsNormalizer,
    phaseChangesNormalizer: PhaseChangesNormalizer,
    missingCastsNormalize: MissingCastsNormalizer,

    // Enhancers
    spellTimeWaitingOnGlobalCooldown: SpellTimeWaitingOnGlobalCooldown,

    // Analyzers
    healingDone: HealingDone,
    damageDone: DamageDone,
    damageTaken: DamageTaken,
    throughputStatisticGroup: ThroughputStatisticGroup,
    deathTracker: DeathTracker,

    enemies: Enemies,
    enemyInstances: EnemyInstances,
    pets: Pets,
    spellManaCost: SpellManaCost,
    channeling: Channeling,
    eventHistory: EventHistory,
    abilityTracker: AbilityTracker,
    haste: Haste,
    statTracker: StatTracker,
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    buffs: Buffs,
    abilitiesMissing: AbilitiesMissing,
    CastEfficiency: CastEfficiency,
    spellUsable: SpellUsable,
    spellHistory: SpellHistory,
    globalCooldown: GlobalCooldown,
    manaValues: ManaValues,
    vantusRune: VantusRune,
    distanceMoved: DistanceMoved,
    deathRecapTracker: DeathRecapTracker,
    dispels: DispelTracker,

    critEffectBonus: CritEffectBonus,

    // Tabs
    raidHealthTab: RaidHealthTab,

    prePotion: PrePotion,
    enchantChecker: EnchantChecker,
    flaskChecker: FlaskChecker,
    foodChecker: FoodChecker,
    healthstone: Healthstone,
    healthPotion: HealthPotion,
    combatPotion: CombatPotion,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    // Racials
    arcaneTorrent: ArcaneTorrent,
    giftOfTheNaaru: GiftOfTheNaaru,
    mightOfTheMountain: MightOfTheMountain,
    stoneform: Stoneform,
    berserking: Berserking,
    bloodFury: BloodFury,

    // Items:
    // BFA
    gildedLoaFigurine: GildedLoaFigurine,
    firstMatesSpyglass: FirstMatesSpyglass,
    seaGiantsTidestone: SeaGiantsTidestone,
    revitalizingVoodooTotem: RevitalizingVoodooTotem,
    ancientKnotOfWisdom: AncientKnotOfWisdom,
    // Dungeons
    cyclotronicBlast: CyclotronicBlast,
    subroutineRecalibration: SubroutineRecalibration,
    mydasTalisman: MydasTalisman,
    lingeringSporepods: LingeringSporepods,
    fangsOfIntertwinedEssence: FangsOfIntertwinedEssence,
    balefireBranch: BalefireBranch,
    conchofDarkWhispers: ConchofDarkWhispers,
    seabreeze: Seabreeze,
    galecallersBoon: GalecallersBoon,
    harlansLoadedDice: HarlansLoadedDice,
    lustrousGoldenPlumage: LustrousGoldenPlumage,
    rezansGleamingEye: RezansGleamingEye,
    rotcrustedVoodooDoll: RotcrustedVoodooDoll,
    azerokksResonatingHeart: AzerokksResonatingHeart,
    vesselOfSkitteringShadows: VesselOfSkitteringShadows,
    ladyWaycrestsMusicBox: LadyWaycrestsMusicBox,
    ingnitionMagesFuse: IgnitionMagesFuse,

    // PVP
    dreadGladiatorsMedallion: DreadGladiatorsMedallion,
    dreadGladiatorsInsignia: DreadGladiatorsInsignia,
    dreadGladiatorsBadge: DreadGladiatorsBadge,
    // Crafted
    darkmoonDeckTides: DarkmoonDeckTides,
    darkmoonDeckFathoms: DarkmoonDeckFathoms,
    darkmoonDeckBlockades: DarkmoonDeckBlockades,
    alchemistStone: AlchemistStone,
    // Enchants
    deadlyNavigation: DeadlyNavigation,
    masterfulNavigation: MasterfulNavigation,
    quickNavigation: QuickNavigation,
    stalwartNavigation: StalwartNavigation,
    versatileNavigation: VersatileNavigation,
    forceMult: ForceMultiplier,
    coastalSurge: CoastalSurge,

    // Azerite Traits
    gemhide: Gemhide,
    crystallineCarapace: CrystallineCarapace,
    gutripper: Gutripper,
    heedMyCall: HeedMyCall,
    laserMatrix: LaserMatrix,
    meticulousScheming: MeticulousScheming,
    overwhelmingPower: OverwhelmingPower,
    elementalWhirl: ElementalWhirl,
    bloodRite: BloodRite,
    bondedSouls: BondedSouls,
    concentratedMending: ConcentratedMending,
    blessedPortents: BlessedPortents,
    tidalSurge: TidalSurge,
    blightborneInfusion: BlightborneInfusion,
    archiveOfTheTitans: ArchiveOfTheTitans,
    savior: Savior,
    woundBinder: WoundBinder,
    synergisticGrowth: SynergisticGrowth,
    bracingChill: BracingChill,
    ephemeralRecovery: EphemeralRecovery,
    unstableCatalyst: UnstableCatalyst,
    swirlingSands: SwirlingSands,
    tradewinds: Tradewinds,
    treacherousCovenant: TreacherousCovenant,
    loyalToTheEnd: LoyalToTheEnd,

    // Essences
    theEverRisingTide: TheEverRisingTide,
    theWellOfExistence: TheWellOfExistence,
    theCrucibleofFlame: TheCrucibleofFlame,
    worldveinResonance: WorldveinResonance,
    nullDynamo: NullDynamo,
    bloodOfTheEnemy: BloodOfTheEnemy,
    strife: Strife,
    theFormlessVoid: TheFormlessVoid,
    essenceOfTheFocusingIris: EssenceOfTheFocusingIris,

    // Uldir
    twitchingTentacleofXalzaix: TwitchingTentacleofXalzaix,
    vigilantsBloodshaper: VigilantsBloodshaper,
    inoculatingExtract: InoculatingExtract,
    freneticCorpuscle: FreneticCorpuscle,
    constructOvercharger: ConstructOvercharger,
    syringeOfBloodborneInfirmity: SyringeOfBloodborneInfirmity,
    discOfSystematicRegression: DiscOfSystematicRegression,
    // BoD
    diamondLacedReflectingPrism: DiamondLacedReflectingPrism,
    wardOfEnvelopment: WardOfEnvelopment,
    crestOfPaku: CrestOfPaku,
    incandescentSliver: IncandescentSliver,
    // Crucible of Storms
    abyssalSpeakersGauntlets: AbyssalSpeakersGauntlets,
    fathuulsFloodguards: FathuulsFloodguards,
    fathomDredgers: FathomDredgers,
    harbingersInscrutableWill: HarbingersInscrutableWill,
    idolOfIndiscriminateConsumption: IdolOfIndiscriminateConsumption,
    gripsOfForsakenSanity: GripsOfForsakenSanity,
    leggingsOfTheAberrantTidesage: LeggingsOfTheAberrantTidesage,
    legplatesOfUnboundAnguish: LegplatesOfUnboundAnguish,
    lurkersInsidiousGift: LurkersInsidiousGift,
    malformedHeraldsLegwraps: MalformedHeraldsLegwraps,
    stormglideSteps: StormglideSteps,
    tridentOfDeepOcean: TridentOfDeepOcean,
    voidStone: VoidStone,
    zaxasjsDeepstriders: ZaxasjsDeepstriders,
    // Eternal Palace
    ashvanesRazorCoral: AshvanesRazorCoral,
    azsharasFontofPower: AzsharasFontofPower,
    bloodthirstyUrchin: BloodthirstyUrchin,
    dribblingInkpod: DribblingInkpod,

    // Nyalotha The Waking City
    vitaChargedTitanshard: VitaChargedTitanshard,
    voidTwistedTitanshard: VoidTwistedTitanshard,
    titanicEmpowerment: TitanicEmpowerment,
    forbiddenObsidianClaw: ForbiddenObsidianClaw,
    hummingBlackDragonscale: HummingBlackDragonscale,

    // Corruptions
    ineffableTruth: IneffableTruth,
    honedMind: HonedMind,
    surgingVitality: SurgingVitality,
    racingPulse: RacingPulse,
    deadlyMomentum: DeadlyMomentum,
    voidRitual: VoidRitual,
    siphoner: Siphoner,
    flashOfInsight: FlashOfInsight,
    versatile: Versatile,
    severe: Severe,
    masterful: Masterful,
    expedient: Expedient,

    // Legendaries
    ashjrakamas: Ashjrakamas,
  };
  // Override this with spec specific modules when extending
  static specModules: DependenciesDefinition = {};

  applyTimeFilter = (start: number, end: number) => null; //dummy function gets filled in by event parser
  applyPhaseFilter = (phase: any, instance: any) => null; //dummy function gets filled in by event parser

  // TODO create report type
  report: any;
  // Character info from the Battle.net API (optional)
  // TODO create profile type
  characterProfile: any;

  // Player info from WCL - required
  player: SelectedPlayer;
  playerPets: Array<any>;
  fight: Fight;
  build: string;
  builds: Builds;
  boss: Boss | null;
  combatantInfoEvents: Array<CombatantInfoEvent>;


  //Disabled Modules
  disabledModules!: {[state in ModuleError]: any[]};

  adjustForDowntime = true;
  get hasDowntime() {
    return this.getModule(TotalDowntime).totalBaseDowntime > 0;
  }

  _modules: {[name: string]: Module} = {};
  get activeModules() {
    return Object.values(this._modules).filter(module => module.active);
  }

  get playerId() {
    return this.player.id;
  }
  get fightId() {
    return this.fight.id;
  }

  _timestamp: number;
  get currentTimestamp() {
    return this.finished ? this.fight.end_time : this._timestamp;
  }
  get fightDuration() {
    return this.currentTimestamp - this.fight.start_time - (this.adjustForDowntime ? this.getModule(TotalDowntime).totalBaseDowntime : 0);
  }
  finished = false;

  get players() {
    return this.report.friendlies;
  }
  /** @var {Combatant} */
  get selectedCombatant() {
    return this.getModule(Combatants).selected;
  }

  constructor(report: any, selectedPlayer: SelectedPlayer, selectedFight: Fight, combatantInfoEvents: Array<CombatantInfoEvent>, characterProfile: any, build: string, builds: Builds) {
    this.report = report;
    this.player = selectedPlayer;
    this.playerPets = report.friendlyPets.filter((pet: { petOwner: any; }) => pet.petOwner === selectedPlayer.id);
    this.fight = selectedFight;
    this.build = build;
    this.builds = builds;
    this.combatantInfoEvents = combatantInfoEvents;
    // combatantinfo events aren't included in the regular events, but they're still used to analysis. We should have them show in the history to make it complete.
    combatantInfoEvents.forEach(event => this.eventHistory.push(event));
    this.characterProfile = characterProfile;
    this._timestamp = selectedFight.start_time;
    this.boss = findByBossId(selectedFight.boss);
    // @ts-ignore populated dynamically but object keys still strongly typed
    this.disabledModules = {};
    //initialize disabled modules for each state
    Object.values(ModuleError).forEach(key => {
      this.disabledModules[key] = [];
    });
    const ctor = this.constructor as typeof CombatLogParser;
    this.initializeModules({
      ...ctor.internalModules,
      ...ctor.defaultModules,
      ...ctor.specModules,
    });
  }
  finish() {
    this.finished = true;
    /** @var {EventEmitter} */
    const emitter = this.getModule(EventEmitter);
    console.log(
      'Events triggered:', emitter.numTriggeredEvents,
      'Event listeners added:', emitter.numEventListeners,
      'Listeners called:', emitter.numListenersCalled,
      'Listeners called (after filters):', emitter.numActualExecutions,
      'Listeners filtered away:', emitter.numListenersCalled - emitter.numActualExecutions,
    );
  }

  _getModuleClass(config: DependencyDefinition): [typeof Module, any] {
    let moduleClass;
    let options;
    if (config instanceof Array) {
      moduleClass = config[0];
      options = config[1];
    } else {
      moduleClass = config;
      options = {};
    }
    return [moduleClass, options];
  }
  _resolveDependencies(dependencies: { [desiredName: string]: typeof Module }) {
    const availableDependencies: {[name: string]: Module} = {};
    const missingDependencies: Array<typeof Module> = [];
    if (dependencies) {
      Object.keys(dependencies).forEach(desiredDependencyName => {
        const dependencyClass = dependencies[desiredDependencyName];

        const dependencyModule = this.getOptionalModule(dependencyClass);
        if (dependencyModule) {
          availableDependencies[desiredDependencyName] = dependencyModule;
        } else {
          missingDependencies.push(dependencyClass);
        }
      });
    }
    return [availableDependencies, missingDependencies] as const;
  }
  /**
   * @param {Module} moduleClass
   * @param {object} [options]
   * @param {string} [desiredModuleName]  Deprecated: will be removed Soon™.
   */
  loadModule<T extends typeof Module>(moduleClass: T, options: {[prop: string]: any; priority: number}, desiredModuleName = `module${Object.keys(this._modules).length}`) {
    // eslint-disable-next-line new-cap
    const module = new moduleClass({
      ...options,
      owner: this,
    });
    if (options) {
      // We can't set the options via the constructor since a parent constructor can't override the values of a child's class properties.
      // See https://github.com/Microsoft/TypeScript/issues/6110 for more info
      Object.keys(options).forEach(key => {
        // @ts-ignore
        module[key] = options[key];
      });
    }
    // TODO: Remove module naming
    module.key = desiredModuleName;
    this._modules[desiredModuleName] = module;
    return module;
  }
  initializeModules(modules: DependenciesDefinition, iteration = 1) {
    // TODO: Refactor and test, this dependency injection thing works really well but it's hard to understand or change.
    const failedModules: Array<string> = [];
    Object.keys(modules).forEach(desiredModuleName => {
      const moduleConfig = modules[desiredModuleName];
      if (!moduleConfig) {
        return;
      }
      const [moduleClass, options] = this._getModuleClass(moduleConfig);
      const [availableDependencies, missingDependencies] = this._resolveDependencies(moduleClass.dependencies);
      const hasMissingDependency = missingDependencies.length === 0;

      if (hasMissingDependency) {
        if (debugDependencyInjection) {
          if (Object.keys(availableDependencies).length === 0) {
            console.log('Loading', moduleClass.name);
          } else {
            console.log('Loading', moduleClass.name, 'with dependencies:', Object.keys(availableDependencies));
          }
        }
        // The priority goes from lowest (most important) to highest, seeing as modules are loaded after their dependencies are loaded, just using the count of loaded modules is sufficient.
        const priority = Object.keys(this._modules).length;
        try {
          this.loadModule(moduleClass, {
            ...options,
            ...availableDependencies,
            priority,
          }, desiredModuleName);
        } catch (e) {
          if (process.env.NODE_ENV !== 'production') {
            throw e;
          }
          this.disabledModules[ModuleError.INITIALIZATION].push({ key: isMinified ? desiredModuleName : moduleClass.name, module: moduleClass, error: e });
          debugDependencyInjection && console.warn(moduleClass.name, 'disabled due to error during initialization: ', e);
        }

      } else {
        const disabledDependencies = missingDependencies
          .map(d => d.name)
          .filter(x =>
            this.disabledModules[ModuleError.INITIALIZATION]
              .map(d => d.module.name)
              .includes(x),
          ); // see if a dependency was previously disabled due to an error
        if (disabledDependencies.length !== 0) {
          // if a dependency was already marked as disabled due to an error, mark this module as disabled
          this.disabledModules[ModuleError.DEPENDENCY].push({ key: isMinified ? desiredModuleName : moduleClass.name, module: moduleClass });
          debugDependencyInjection && console.warn(moduleClass.name, 'disabled due to error during initialization of a dependency.');
        } else {
          debugDependencyInjection && console.warn(moduleClass.name, 'could not be loaded, missing dependencies:', missingDependencies.map(d => d.name));
          failedModules.push(desiredModuleName);
        }
      }
    });

    if (failedModules.length !== 0) {
      debugDependencyInjection && console.warn(`${failedModules.length} modules failed to load, trying again:`, failedModules.map(key => {
        const def = modules[key];
        if (def instanceof Array) {
          return def[0].name;
        } else {
          return (def as typeof Module).name;
        }
      }));
      const newBatch: DependenciesDefinition = {};
      failedModules.forEach(key => {
        newBatch[key] = modules[key];
      });
      if (iteration > MAX_DI_ITERATIONS) {
        // Sometimes modules can't be imported at all because they depend on modules not enabled or have a circular dependency. Stop trying after a while.
        // eslint-disable-next-line no-debugger
        debugger;
        throw new Error(`Failed to load modules: ${Object.keys(newBatch).join(', ')}`);
      }
      this.initializeModules(newBatch, iteration + 1);
    } else {
      this.allModulesInitialized();
    }
  }
  allModulesInitialized() {
    // Executed when module initialization is complete
  }
  _moduleCache = new Map();
  getOptionalModule<T extends Module>(type: { new(options: any): T }): T|undefined {
    // We need to use a cache and can't just set this on initialization because we sometimes search by the inheritance chain.
    const cacheEntry = this._moduleCache.get(type);
    if (cacheEntry !== undefined) {
      return cacheEntry;
    }
    // Search for a specific module by its type, accepting any modules that have the type somewhere in the inheritance chain
    const module = Object.values(this._modules).find(module => module instanceof type);
    this._moduleCache.set(type, module);
    return module as T;
  }
  getModule<T extends Module>(type: { new(options: any): T }): T {
    const module = this.getOptionalModule(type);
    if (module === undefined) {
      throw new Error(`Module not found: ${type.name}`);
    }
    return module;
  }
  normalize(events: Array<Event<any>>) {
    this.activeModules
      .filter(module => module instanceof EventsNormalizer)
      .map(module => module as EventsNormalizer)
      .sort((a, b) => a.priority - b.priority) // lowest should go first, as `priority = 0` will have highest prio
      .forEach(normalizer => {
        if (normalizer.normalize) {
          events = normalizer.normalize(events);
        }
      });
    return events;
  }

  /** @type {number} The amount of events parsed. This can reliably be used to determine if something should re-render. */
  eventCount = 0;
  eventHistory: Array<Event<any>> = [];
  addEventListener<ET extends string, E extends Event<ET>>(eventFilter: ET | EventFilter<ET>, listener: EventListener<ET, E>, module: Module) {
    this.getModule(EventEmitter).addEventListener(eventFilter, listener, module);
  }

  deepDisable(module: Module, state: ModuleError, error: Error|undefined = undefined) {
    if (!module.active) {
      return; //return early
    }
    console.error('Disabling', isMinified ? module.key : module.constructor.name);
    this.disabledModules[state].push({ key: isMinified ? module.key : module.constructor.name, module: module.constructor, ...(error && { error: error }) });
    module.active = false;
    this.activeModules.forEach(active => {
        const ctor = active.constructor as typeof Module;
        const deps = ctor.dependencies;
        // Inspectors may light up `module instanceof depClass` because of the constructor cast
        if (deps && Object.values(deps).find(depClass => module instanceof depClass)) {
          this.deepDisable(active, ModuleError.DEPENDENCY);
        }
      },
    );
  }

  byPlayer<ET extends string>(event: Event<ET>, playerId = this.player.id) {
      return HasSource(event) && event.sourceID === playerId;
  }
  toPlayer<ET extends string>(event: Event<ET>, playerId = this.player.id) {
    return HasTarget(event) && (event.targetID === playerId);
  }
  byPlayerPet<ET extends string>(event: Event<ET>) {
    return HasSource(event) && this.playerPets.some(pet => pet.id === event.sourceID);
  }
  toPlayerPet<ET extends string>(event: Event<ET>) {
    return HasTarget(event) && this.playerPets.some(pet => pet.id === event.targetID);
  }

  getPercentageOfTotalHealingDone(healingDone: number) {
    return healingDone / this.getModule(HealingDone).total.effective;
  }
  formatItemHealingDone(healingDone: number) {
    return `${formatPercentage(this.getPercentageOfTotalHealingDone(healingDone))} % / ${formatNumber(healingDone / this.fightDuration * 1000)} HPS`;
  }
  formatItemAbsorbDone(absorbDone: number) {
    return `${formatNumber(absorbDone)}`;
  }
  getPercentageOfTotalDamageDone(damageDone: number) {
    return damageDone / this.getModule(DamageDone).total.effective;
  }
  formatItemDamageDone(damageDone: number) {
    return `${formatPercentage(this.getPercentageOfTotalDamageDone(damageDone))} % / ${formatNumber(damageDone / this.fightDuration * 1000)} DPS`;
  }
  getPercentageOfTotalDamageTaken(damageTaken: number) {
    return damageTaken / this.getModule(DamageTaken).total.effective;
  }
  formatTimestamp(timestamp: number, precision = 0) {
    return formatDuration((timestamp - this.fight.start_time) / 1000, precision);
  }

  generateResults(adjustForDowntime: boolean): ParseResults {
    this.adjustForDowntime = adjustForDowntime;

    let results: ParseResults = new ParseResults();

    const addStatistic = (statistic: any, basePosition: number, key: string) => {
      if(!statistic) {
        return;
      }
      const position = statistic.props.position !== undefined ? statistic.props.position : basePosition;
      results.statistics.push(
        React.cloneElement(statistic, {
          key,
          position,
        }),
      );
    };

    const attemptResultGeneration = () => {
      return Object.keys(this._modules)
        .filter(key => this._modules[key].active)
        .sort((a, b) => this._modules[b].priority - this._modules[a].priority)
        .every((key, index) => {
          const module = this._modules[key];

          try {
            if(module instanceof Analyzer) {
              const analyzer = module as Analyzer;
              if (analyzer.statistic) {
                let basePosition = index;
                if (analyzer.statisticOrder !== undefined) {
                  basePosition = analyzer.statisticOrder;
                  console.warn('DEPRECATED', 'Setting the position of a statistic via a module\'s `statisticOrder` prop is deprecated. Set the `position` prop on the `StatisticBox` instead. Example commit: https://github.com/WoWAnalyzer/WoWAnalyzer/commit/ece1bbeca0d3721ede078d256a30576faacb803d', module);
                }

                // TODO - confirm removing i18n doesn't actually change anything here
                const statistic = analyzer.statistic();
                if (statistic) {
                  if (Array.isArray(statistic)) {
                    statistic.forEach((statistic, statisticIndex) => {
                      addStatistic(statistic, basePosition, `${key}-statistic-${statisticIndex}`);
                    });
                  } else {
                    addStatistic(statistic, basePosition, `${key}-statistic`);
                  }
                }
              }
              if (analyzer.tab) {
                const tab = analyzer.tab();
                if (tab) {
                  results.tabs.push(tab);
                }
              }
              if (analyzer.suggestions) {
                analyzer.suggestions(results.suggestions.when);
              }
            }
          } catch (e) { //error occured during results generation of module, disable module and all modules depending on it
            if (process.env.NODE_ENV !== 'production') {
              throw e;
            }
            this.deepDisable(module, ModuleError.RESULTS, e);
            //break loop and start again with inaccurate modules now disabled (in case of modules being rendered before their dependencies' errors are encountered)
            return false;
          }
          return true;
        });
    };

    //keep trying to generate results until no "new" errors are found anymore to weed out all the inaccurate / errored modules
    let generated = false;
    while (!generated) {
      results = new ParseResults();

      results.tabs = [];
      generated = attemptResultGeneration();
    }

    return results;
  }
}
export type SelectedPlayer = {
  name: string,
  id: number,
  guid: number,
  type: string,
}

export default CombatLogParser;
