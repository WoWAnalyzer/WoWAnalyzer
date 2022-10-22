import {
  FaelineStomp,
  InvokersDelight,
  MysticTouch,
  TouchOfDeath,
  DampenHarm,
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
import Checklist from './modules/features/Checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import EssenceFontHealingBreakdown from './modules/features/EssenceFontHealingBreakdown';
import EvmVivCastRatio from './modules/features/EvmVivCastRatio';
import MasteryStats from './modules/features/MasteryStats';
import MistweaverHealingEfficiencyDetails from './modules/features/MistweaverHealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/MistweaverHealingEfficiencyTracker';
import REMGraph from './modules/features/REMGraph';
import JadeBond from './modules/spells/JadeBond';
import NourishingChi from './modules/spells/NourishingChi';
import RisingSunRevival from './modules/spells/UpliftedSpirits';
import BonedustBrewAverageTargets from './modules/spells/BonedustBrewAverageTargets';
import FaelineStompHealing from './modules/spells/FaelineStompHealing';
import AncientTeachingsoftheMonastery from './modules/spells/AncientTeachingsoftheMonastery';
import CloudedFocus from './modules/spells/CloudedFocus';
import EnvelopingBreath from './modules/spells/EnvelopingBreath';
import EnvelopingMists from './modules/spells/EnvelopingMists';
import EssenceFont from './modules/spells/EssenceFont';
import EssenceFontCancelled from './modules/spells/EssenceFontCancelled';
import EssenceFontTargetsHit from './modules/spells/EssenceFontTargetsHit';
import EssenceFontUniqueTargets from './modules/spells/EssenceFontUniqueTargets';
import ExpelHarm from './modules/spells/ExpelHarm';
import InvokeYulon from './modules/spells/InvokeYulon';
import LifeCocoon from './modules/spells/LifeCocoon';
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
import Lifecycles from './modules/spells/Lifecycles';
import ManaTea from './modules/spells/ManaTea';
import MistWrapEnvelopingBreath from './modules/spells/MistWrapEnvelopingBreath';
import MistyPeaks from './modules/spells/MistyPeaks';
import RefreshingJadeWind from './modules/spells/RefreshingJadeWind';
import RenewingMistDuringManaTea from './modules/spells/RenewingMistDuringManaTea';
import RisingMist from './modules/spells/RisingMist';
import SpiritOfTheCrane from './modules/spells/SpiritOfTheCrane';
import Upwelling from './modules/spells/Upwelling';
import HotApplicationNormalizer from './normalizers/HotApplicationNormalizer';
import HotRemovalNormalizer from './normalizers/HotRemovalNormalizer';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizer
    castLinkNormalizer: CastLinkNormalizer,
    hotApplicationNormalizer: HotApplicationNormalizer,
    hotRemovalNormalizer: HotRemovalNormalizer,

    // Core
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
    checklist: Checklist,
    evmVivCastRatio: EvmVivCastRatio,
    masteryStats: MasteryStats,
    buffs: Buffs,
    essenceFontHealingBreakDown: EssenceFontHealingBreakdown,
    averageTimeBetweenRSKSs: AverageTimeBetweenRSKSs,
    remGraph: REMGraph,

    // Base Spells
    spinningCraneKick: SpinningCraneKick,
    vivify: Vivify,

    // Shared Talents
    chiBurst: ChiBurst,
    dampenHarm: DampenHarm,
    touchOfDeath: TouchOfDeath,
    risingSunKick: RisingSunKick,

    // MW Talents
    ancientTeachingsoftheMonastery: AncientTeachingsoftheMonastery,
    bonedustBrewAverageTargets: BonedustBrewAverageTargets,
    cloudedFocus: CloudedFocus,
    envelopingBreath: EnvelopingBreath,
    envelopingMists: EnvelopingMists,
    essenceFont: EssenceFont,
    essenceFontUniqueTargets: EssenceFontUniqueTargets,
    essenceFontTargetsHit: EssenceFontTargetsHit,
    expelHarm: ExpelHarm,
    EssenceFontCancelled: EssenceFontCancelled,
    faelineStomp: FaelineStomp,
    faelineStompHealing: FaelineStompHealing,
    invokersDelight: InvokersDelight,
    invokeChiJi: InvokeChiJi,
    invokeYulon: InvokeYulon,
    jadeSerpentStatue: JadeSerpentStatue,
    jadeBond: JadeBond,
    lifecycles: Lifecycles,
    lifeCocoon: LifeCocoon,
    mistWrapEnvelopingBreath: MistWrapEnvelopingBreath,
    manaTea: ManaTea,
    mistyPeaks: MistyPeaks,
    nourishingCh: NourishingChi,
    refreshingJadeWind: RefreshingJadeWind,
    renewingMist: RenewingMist,
    renewingMistDuringManaTea: RenewingMistDuringManaTea,
    revival: Revival,
    risingMist: RisingMist,
    risingSunRevival: RisingSunRevival,
    spiritOfTheCrane: SpiritOfTheCrane,
    soothingMist: SoothingMist,
    thunderFocusTea: ThunderFocusTea,
    upwelling: Upwelling,

    // Mana Tab
    manaTracker: ManaTracker,
    hpmDetails: MistweaverHealingEfficiencyDetails,
    hpmTracker: HealingEfficiencyTracker,
  };
}

export default CombatLogParser;
