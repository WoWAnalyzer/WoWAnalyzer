import {
  JadefireStomp,
  InvokersDelight,
  MysticTouch,
  TouchOfDeath,
  SaveThemAll,
  TeachingsOfTheMonestary,
} from 'analysis/retail/monk/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import CoreChanneling from 'parser/shared/normalizers/Channeling';

import GlobalCooldown from './modules/core/GlobalCooldown';
import HotTrackerMW from './modules/core/HotTrackerMW';
import HotAttributor from './modules/core/HotAttributor';
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import EvmVivCastRatio from './modules/features/EvmVivCastRatio';
import MasteryStats from './modules/features/MasteryStats';
import MistweaverHealingEfficiencyDetails from './modules/features/MistweaverHealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/MistweaverHealingEfficiencyTracker';
import REMGraph from './modules/features/REMGraph';
import JadeBond from './modules/spells/JadeBond';
import NourishingChi from './modules/spells/NourishingChi';
import RisingSunRevival from './modules/spells/UpliftedSpirits';
import JadefireStompHealing from './modules/spells/JadefireStompHealing';
import AncientTeachings from './modules/spells/AncientTeachings';
import EnvelopingBreath from './modules/spells/EnvelopingBreath';
import EnvelopingMists from './modules/spells/EnvelopingMists';
import ExpelHarm from './modules/spells/ExpelHarm';
import InvokeYulon from './modules/spells/InvokeYulon';
import RenewingMist from './modules/spells/RenewingMist';
import Revival from './modules/spells/Revival';
import RisingSunKick from './modules/spells/RisingSunKick';
import SoothingMist from './modules/spells/SoothingMist';
import SpinningCraneKick from './modules/spells/SpinningCraneKick';
import ThunderFocusTea from './modules/spells/ThunderFocusTea';
import Vivify from './modules/spells/Vivify';
import AverageTimeBetweenRSKSs from './modules/spells/AverageTimeBetweenRSKs';
import ChiBurst from './modules/spells/ChiBurst';
import InvokeChiJi from './modules/spells/InvokeChiJi';
import JadeSerpentStatue from './modules/spells/JadeSerpentStatue';
import ManaTea from './modules/spells/ManaTea';
import MistyPeaks from './modules/spells/MistyPeaks';
import MistsOfLife from './modules/spells/MistsOfLife';
import RefreshingJadeWind from './modules/spells/RefreshingJadeWind';
import RenewingMistDuringManaTea from './modules/spells/RenewingMistDuringManaTea';
import RisingMist from './modules/spells/RisingMist';
import VivaciousVivification from './modules/spells/VivaciousVivify';
import YulonsWhisper from './modules/spells/YulonsWhisper';
import HotApplicationNormalizer from './normalizers/HotApplicationNormalizer';
import HotRemovalNormalizer from './normalizers/HotRemovalNormalizer';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';
import Unison from './modules/spells/Unison';
import RapidDiffusion from './modules/spells/RapidDiffusion';
import DancingMists from './modules/spells/DancingMists';
import MistyPeaksHealingBreakdown from './modules/features/MistyPeaksHealingBreakdown';
import TalentHealingStatistic from './modules/features/TalentHealingStatistic';
import MendingProliferation from './modules/spells/MendingProliferation';
import SheilunsGift from './modules/spells/SheilunsGift';
import MistWrap from './modules/spells/MistWrap';
import ShaohaosLessons from './modules/spells/ShaohaosLessons';
import LegacyOfWisdom from './modules/spells/LegacyOfWisdom';
import VeilOfPride from './modules/spells/VeilOfPride';
import Guide from './Guide';
import SheilunsGiftCloudTracker from './modules/spells/SheilunsGiftCloudTracker';
import SheilunsGiftCloudGraph from './modules/spells/SheilunsGiftCloudGraph';
import HotCountGraph from './modules/features/HotCountGraph';
import AplCheck from './modules/core/apl/AplCheck';
import RisingMistBreakdown from './modules/features/RisingMistBreakdown';
import CalmingCoalescence from './modules/spells/CalmingCoalescence';
import LifeCocoon from './modules/spells/LifeCocoon';
import SecretInfusion from './modules/spells/SecretInfusion';
import MWSpellManaCost from './modules/core/SpellManaCost';
import ManaTeaSources from './modules/spells/ManaTeaSources';
import EnergizingBrew from './modules/spells/EnergizingBrew';
import ChiHarmony from './modules/spells/ChiHarmony';
import TearOfMorning from './modules/spells/TearOfMorning';
import LotusInfusion from './modules/spells/LotusInfusion';
import CraneStyle from './modules/spells/CraneStyle';
import ZenPulse from './modules/spells/ZenPulse';
import T32TierSet from './modules/tier/T32TierSet';
import PoolOfMists from './modules/spells/PoolOfMists';
import HeartOfTheJadeSerpent from '../shared/hero/ConduitOfTheCelestials/talents/HeartOfTheJadeSerpent';
import RestoreBalance from '../shared/hero/ConduitOfTheCelestials/talents/RestoreBalance';
import ConduitOfTheCelestialsEventLinks from '../shared/hero/ConduitOfTheCelestials/normalizers/ConduitOfTheCelestialsEventLinks';
import CelestialConduitNormalizer from '../shared/hero/ConduitOfTheCelestials/normalizers/CelestialConduitNormalizer';
import CelestialConduit from '../shared/hero/ConduitOfTheCelestials/talents/CelestialConduit';
import StrengthOfTheBlackOx from './modules/heroTalents/StrengthOfTheBlackOx';
import Coalesence from '../shared/hero/MasterOfHarmony/talents/Coalesence';
import AspectOfHarmony from './modules/heroTalents/AspectOfHarmony';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizer
    castLinkNormalizer: CastLinkNormalizer,
    celestialConduitNormalizer: CelestialConduitNormalizer,
    conduitOfTheCelestialsEventLinks: ConduitOfTheCelestialsEventLinks,
    hotApplicationNormalizer: HotApplicationNormalizer,
    hotRemovalNormalizer: HotRemovalNormalizer,

    // Core
    mwSpellManaCost: MWSpellManaCost,
    lowHealthHealing: LowHealthHealing,
    channeling: CoreChanneling,
    globalCooldown: GlobalCooldown,
    hotTrackerMW: HotTrackerMW,
    hotAttributor: HotAttributor,
    mysticTouch: MysticTouch,

    // Generic healer things
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    evmVivCastRatio: EvmVivCastRatio,
    masteryStats: MasteryStats,
    buffs: Buffs,
    mistyPeaksHealingBreakdown: MistyPeaksHealingBreakdown,
    averageTimeBetweenRSKSs: AverageTimeBetweenRSKSs,
    remGraph: REMGraph,
    hotCountGraph: HotCountGraph,
    talentHealingStatistic: TalentHealingStatistic,
    risingMistBreakdown: RisingMistBreakdown,

    // Guide helpers
    sheilunsGiftCloudTracker: SheilunsGiftCloudTracker,
    sheilunsGiftCloudGraph: SheilunsGiftCloudGraph,

    // Base Spells
    spinningCraneKick: SpinningCraneKick,
    vivify: Vivify,

    // Shared Talents
    chiBurst: ChiBurst,
    touchOfDeath: TouchOfDeath,
    risingSunKick: RisingSunKick,
    saveThemAll: SaveThemAll,
    vivaciousVivification: VivaciousVivification,

    // MW Talents
    ancientTeachings: AncientTeachings,
    energizingBrew: EnergizingBrew,
    envelopingBreath: EnvelopingBreath,
    envelopingMists: EnvelopingMists,
    expelHarm: ExpelHarm,
    jadefireStomp: JadefireStomp,
    jadefireStompHealing: JadefireStompHealing,
    invokersDelight: InvokersDelight,
    invokeChiJi: InvokeChiJi,
    invokeYulon: InvokeYulon,
    jadeSerpentStatue: JadeSerpentStatue,
    jadeBond: JadeBond,
    mistWrap: MistWrap,
    manaTea: ManaTea,
    manaTeaSources: ManaTeaSources,
    mistsOfLife: MistsOfLife,
    mistyPeaks: MistyPeaks,
    nourishingCh: NourishingChi,
    refreshingJadeWind: RefreshingJadeWind,
    renewingMist: RenewingMist,
    renewingMistDuringManaTea: RenewingMistDuringManaTea,
    revival: Revival,
    risingMist: RisingMist,
    risingSunRevival: RisingSunRevival,
    soothingMist: SoothingMist,
    thunderFocusTea: ThunderFocusTea,
    yulonsWhisper: YulonsWhisper,
    unison: Unison,
    rapidDiffusion: RapidDiffusion,
    dancingMists: DancingMists,
    mendingProliferation: MendingProliferation,
    teachingsOfTheMonestary: TeachingsOfTheMonestary,
    sheilunsGift: SheilunsGift,
    shaohaosLessons: ShaohaosLessons,
    veilOfPride: VeilOfPride,
    legacyOfWisdom: LegacyOfWisdom,
    calmingCoalescence: CalmingCoalescence,
    lifeCocoon: LifeCocoon,
    secretInfusion: SecretInfusion,
    tearOfMorning: TearOfMorning,
    lotusInfusion: LotusInfusion,
    craneStyle: CraneStyle,
    zenPulse: ZenPulse,
    chiHarmony: ChiHarmony,
    poolOfMists: PoolOfMists,

    // Hero Talents
    // Conduit
    celestialConduit: CelestialConduit,
    heartOfTheJadeSerpent: HeartOfTheJadeSerpent,
    restoreBalance: RestoreBalance,
    apl: AplCheck,
    // Harmony
    coalesence: Coalesence,

    // Borrowed Power
    t32TierSet: T32TierSet,

    // Mana Tab
    manaTracker: ManaTracker,
    hpmDetails: MistweaverHealingEfficiencyDetails,
    hpmTracker: HealingEfficiencyTracker,

    // Hero Talents
    strengthOfTheBlackOx: StrengthOfTheBlackOx,
    aspectOfHarmony: AspectOfHarmony,
  };
  static guide = Guide;
}

export default CombatLogParser;
