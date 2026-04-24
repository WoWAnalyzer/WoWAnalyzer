import {
  Channeling,
  DeathTracker,
  NaturalMending,
  Trailblazer,
  BornToBeWild,
  BindingShot,
  FocusTracker,
  SpellFocusCost,
  TranquilizingShot,
  BlackArrow,
  Deathblow,
  RejuvenatingWind,
  CancelledCasts,
} from '../shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import GlobalCooldown from './modules/core/GlobalCooldown';
import SpellUsable from './modules/core/SpellUsable';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import DireCommand from './modules/talents/DireCommand';
import BasicAttacks from './modules/pets/BasicAttacksTracker';
import BeastMasteryFocusCapTracker from './modules/resources/BeastMasteryFocusCapTracker';
import BeastMasteryFocusUsage from './modules/resources/BeastMasteryFocusUsage';
import Focus from './modules/resources/Focus';
import BeastCleave from './modules/talents/BeastCleave';
import BestialWrath from './modules/talents/BestialWrath';
import CobraShot from './modules/talents/CobraShot';
import AspectOfTheBeast from './modules/talents/AspectOfTheBeast';
import DireBeast from './modules/talents/DireBeast';
import ScentOfBlood from './modules/talents/ScentOfBlood';
import Stomp from './modules/talents/Stomp';
import DireBeastSummonNormalizer from './normalizers/DireBeastSummonNormalizer';
import DireCommandNormalizer from './normalizers/DireCommandNormalizer';
import Guide from './modules/guide/Guide';
import FocusGraph from './modules/guide/sections/resources/FocusGraph';
import Bloodshed from './modules/talents/Bloodshed';
import NaturesAlly from './modules/talents/NaturesAlly';
import BarbedScales from './modules/talents/BarbedScales';
import KillerCobra from './modules/talents/KillerCobra';
import WarOrders from './modules/talents/WarOrders';
import MasterHandler from './modules/talents/MasterHandler';
import WailingArrow from './modules/talents/WailingArrow';
import HowlOfThePackLeader from './modules/talents/HowlOfThePackLeader';
import HowlOfThePackLeaderBear from './modules/talents/HowlOfThePackLeaderBear';
import HowlOfThePackLeaderHog from './modules/talents/HowlOfThePackLeaderHog';
import PackMentality from './modules/talents/PackMentality';
import DarkHound from './modules/talents/DarkHound';
import HunterEventLinkNormalizers from '../shared/normalizers/HunterEventLinkNormalizers';
import ExhilarationTiming from '../shared/guide/defensives/Exhiliration';
import SurvivalOfTheFittest from '../shared/talents/SurvivalOfTheFittest';
import AspectOfTheTurtle from '../shared/talents/AspectOfTheTurtle';
import AplCheck from './modules/core/AplCheck';
import HuntermastersCall from 'analysis/retail/hunter/beastmastery/modules/talents/HuntermastersCall';
import SnakeskinQuiver from 'analysis/retail/hunter/beastmastery/modules/talents/SnakeskinQuiver';
import WitheringFire from 'analysis/retail/hunter/shared/talents/WitheringFire';
import WildInstinctsNormalizer from 'analysis/retail/hunter/beastmastery/normalizers/WildInstinctsNormalizer';
import SnakeskinQuiverNormalizer from 'analysis/retail/hunter/beastmastery/normalizers/SnakeskinQuiverNormalizer';

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
    exhilarationTiming: ExhilarationTiming,
    aplCheck: AplCheck,

    //Resources
    focusTracker: FocusTracker,
    spellFocusCost: SpellFocusCost,
    beastMasteryFocusCapTracker: BeastMasteryFocusCapTracker,
    focus: Focus,
    beastMasteryFocusUsage: BeastMasteryFocusUsage,

    //Normalizers
    direBeastSummonNormalizer: DireBeastSummonNormalizer,
    direCommandNormalizer: DireCommandNormalizer,
    hunterEventLinkNormalizer: HunterEventLinkNormalizers,
    wildInstinctsNormalizer: WildInstinctsNormalizer,
    snakeskinQuiverNormalizer: SnakeskinQuiverNormalizer,

    //DeathTracker
    deathTracker: DeathTracker,

    //Pets
    basicAttacks: BasicAttacks,

    //Spells
    bestialWrath: BestialWrath,
    beastCleave: BeastCleave,
    cobraShot: CobraShot,
    blackArrow: BlackArrow,
    wailingArrow: WailingArrow,

    //Talents
    direBeast: DireBeast,
    naturalMending: NaturalMending,
    trailblazer: Trailblazer,
    stomp: Stomp,
    aspectOfTheBeast: AspectOfTheBeast,
    scentOfBlood: ScentOfBlood,
    bornToBeWild: BornToBeWild,
    bindingShot: BindingShot,
    direCommand: DireCommand,
    bloodshed: Bloodshed,
    snakeskinQuiver: SnakeskinQuiver,
    witheringFire: WitheringFire,
    tranquilizingShot: TranquilizingShot,
    deathblow: Deathblow,
    naturesAlly: NaturesAlly,
    killerCobra: KillerCobra,
    warOrders: WarOrders,
    masterHandler: MasterHandler,
    huntmastersCall: HuntermastersCall,
    howlOfThePackLeader: HowlOfThePackLeader,
    howlOfThePackLeaderBear: HowlOfThePackLeaderBear,
    howlOfThePackLeaderHog: HowlOfThePackLeaderHog,
    packMentality: PackMentality,
    darkHound: DarkHound,
    survivalOfTheFittest: SurvivalOfTheFittest,
    aspectOfTheTurtle: AspectOfTheTurtle,
    barbedScales: BarbedScales,
    rejuvenatingWind: RejuvenatingWind,
    cancelledCasts: CancelledCasts,

    //Items
  };
}

export default CombatLogParser;
