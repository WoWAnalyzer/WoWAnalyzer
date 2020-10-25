import CoreCombatLogParser from 'parser/core/CombatLogParser';

import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';

import GlobalCooldown from './modules/core/GlobalCooldown';
import CoreChanneling from './modules/core/Channeling';
import HotTrackerMW from './modules/core/HotTrackerMW';

// Normalizers
import HotApplicationNormalizer from './normalizers/HotApplicationNormalizer';
import HotRemovalNormalizer from './normalizers/HotRemovalNormalizer';

// Features
import Abilities from './modules/features/Abilities';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import EssenceFontMastery from './modules/features/EssenceFontMastery';
import Checklist from './modules/features/Checklist/Module';
import StatValues from './modules/features/StatValues';
import EvmVivCastRatio from './modules/features/EvmVivCastRatio';
import MasteryStats from './modules/features/MasteryStats';
import Buffs from './modules/features/Buffs';

// Spells
import ThunderFocusTea from './modules/spells/ThunderFocusTea';
import EssenceFont from './modules/spells/EssenceFont';
import EnvelopingMists from './modules/spells/EnvelopingMists';
import SoothingMist from './modules/spells/SoothingMist';
import Vivify from './modules/spells/Vivify';
import LifeCocoon from './modules/spells/LifeCocoon';
import SpinningCraneKick from './modules/spells/SpinningCraneKick';
import RenewingMist from './modules/spells/RenewingMist';
import TouchOfDeath from '../shared/modules/spells/TouchOfDeath';
import InvokeYulon from './modules/spells/InvokeYulon';
import InvokeChiJi from './modules/talents/InvokeChiJi';
import ExpelHarm from './modules/spells/ExpelHarm';
import EnvelopingBreath from './modules/spells/EnvelopingBreath';

// Talents
import JadeSerpentStatue from './modules/talents/JadeSerpentStatue';
import ChiBurst from './modules/talents/ChiBurst';
import ManaTea from './modules/talents/ManaTea';
import RefreshingJadeWind from './modules/talents/RefreshingJadeWind';
import Lifecycles from './modules/talents/Lifecycles';
import SpiritOfTheCrane from './modules/talents/SpiritOfTheCrane';
import RisingMist from './modules/talents/RisingMist';
import AverageTimeBetweenRSKSs from './modules/talents/AverageTimeBetweenRSKs';
import RenewingMistDuringManaTea from './modules/talents/RenewingMistDuringManaTea';
import Tier45Comparison from './modules/talents/Tier45Comparison';
import Upwelling from './modules/talents/Upwelling';

// Mana Tracker
import MistweaverHealingEfficiencyDetails from './modules/features/MistweaverHealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/MistweaverHealingEfficiencyTracker';
import ManaTracker from '../../core/healingEfficiency/ManaTracker';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './constants';
import EssenceFontHealingBreakdown from './modules/features/EssenceFontHealingBreakdown';

// Covenants
import FallenOrder from '../shared/modules/covenants/FallenOrder';

// Conduits
// Endurance
import GroundingBreath from '../shared/modules/conduits/GroundingBreath';
import HarmDenial from '../shared/modules/conduits/HarmDenial';
import FortifyingIngredients from '../shared/modules/conduits/FortifyingIngredients';

// Potency
import JadeBond from './modules/shadowlands/conduits/JadeBond';
import NourishingChi from './modules/shadowlands/conduits/NourishingChi';
import RisingSunRevival from './modules/shadowlands/conduits/RisingSunRevival';
import ImbuedReflections from '../shared/modules/conduits/ImbuedReflections';

// Legendaries
import TearofMorning from './modules/shadowlands/legendaries/TearofMorning';
import AncientTeachingsoftheMonastery from './modules/shadowlands/legendaries/AncientTeachingsoftheMonastery';
import CloudedFocus from './modules/shadowlands/legendaries/CloudedFocus';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Normalizer
    hotApplicationNormalizer: HotApplicationNormalizer,
    hotRemovalNormalizer: HotRemovalNormalizer,

    // Core
    lowHealthHealing: LowHealthHealing,
    channeling: CoreChanneling,
    globalCooldown: GlobalCooldown,
    hotTrackerMW: HotTrackerMW,

    // Generic healer things
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    cooldownThroughputTracker: CooldownThroughputTracker,
    essenceFontMastery: EssenceFontMastery,
    checklist: Checklist,
    statValues: StatValues,
    evmVivCastRatio: EvmVivCastRatio,
    masteryStats: MasteryStats,
    buffs: Buffs,
    essenceFontHealingBreakDown: EssenceFontHealingBreakdown,
    averageTimeBetweenRSKSs: AverageTimeBetweenRSKSs,

    // Spells
    essenceFont: EssenceFont,
    thunderFocusTea: ThunderFocusTea,
    envelopingMists: EnvelopingMists,
    soothingMist: SoothingMist, // Removed as this needs to be reworked with updated Soothing Mist Spell in BfA
    spinningCraneKick: SpinningCraneKick,
    vivify: Vivify,
    renewingMist: RenewingMist,
    lifeCocoon: LifeCocoon,
    touchOfDeath: TouchOfDeath,
    invokeYulon: InvokeYulon,
    expelHarm: ExpelHarm,
    envelopingBreath: EnvelopingBreath,

    // Talents
    chiBurst: ChiBurst,
    manaTea: ManaTea,
    refreshingJadeWind: RefreshingJadeWind,
    lifecycles: Lifecycles,
    spiritOfTheCrane: SpiritOfTheCrane,
    risingMist: RisingMist,
    jadeSerpentStatue: JadeSerpentStatue,
    renewingMistDuringManaTea: RenewingMistDuringManaTea,
    tier45Comparison: Tier45Comparison,
    upwelling: Upwelling,
    invokeChiJi: InvokeChiJi,

    // Mana Tab
    manaTracker: ManaTracker,
    hpmDetails: MistweaverHealingEfficiencyDetails,
    hpmTracker: HealingEfficiencyTracker,

    // Covenants
    fallenOrder: FallenOrder,

    // Conduits
    // Endurance
    groundingBreath: GroundingBreath,
    harmDenial: HarmDenial,
    fortifyingIngredients: FortifyingIngredients,

    // Potency
    jadeBond: JadeBond,
    nourishingChi: NourishingChi,
    risingSunRevival: RisingSunRevival,
    imbuedReflections: ImbuedReflections,

    // Legendaries
    tearofMorning: TearofMorning,
    ancientTeachingsoftheMonastery: AncientTeachingsoftheMonastery,
    cloudedFocus: CloudedFocus,
  };
}

export default CombatLogParser;
