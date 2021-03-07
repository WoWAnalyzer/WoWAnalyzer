import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';

import {
  FaelineStomp,
  FallenOrder,
  FortifyingIngredients,
  GroundingBreath,
  HarmDenial,
  ImbuedReflections,
  TouchOfDeath,
} from '@wowanalyzer/monk';

// Normalizers

// Features
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './constants';
import CoreChanneling from './modules/core/Channeling';
import GlobalCooldown from './modules/core/GlobalCooldown';
import HotTrackerMW from './modules/core/HotTrackerMW';
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import Checklist from './modules/features/Checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import EssenceFontHealingBreakdown from './modules/features/EssenceFontHealingBreakdown';
import EssenceFontMastery from './modules/features/EssenceFontMastery';
import EvmVivCastRatio from './modules/features/EvmVivCastRatio';
import MasteryStats from './modules/features/MasteryStats';
import MistweaverHealingEfficiencyDetails from './modules/features/MistweaverHealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/MistweaverHealingEfficiencyTracker';
import StatValues from './modules/features/StatValues';

// Spells
import JadeBond from './modules/shadowlands/conduits/JadeBond';
import NourishingChi from './modules/shadowlands/conduits/NourishingChi';
import RisingSunRevival from './modules/shadowlands/conduits/RisingSunRevival';
import AncientTeachingsoftheMonastery from './modules/shadowlands/legendaries/AncientTeachingsoftheMonastery';
import CloudedFocus from './modules/shadowlands/legendaries/CloudedFocus';
import TearofMorning from './modules/shadowlands/legendaries/TearofMorning';
import EnvelopingBreath from './modules/spells/EnvelopingBreath';
import EnvelopingMists from './modules/spells/EnvelopingMists';
import EssenceFont from './modules/spells/EssenceFont';
import ExpelHarm from './modules/spells/ExpelHarm';
import InvokeYulon from './modules/spells/InvokeYulon';
import LifeCocoon from './modules/spells/LifeCocoon';
import RenewingMist from './modules/spells/RenewingMist';
import SoothingMist from './modules/spells/SoothingMist';
import SpinningCraneKick from './modules/spells/SpinningCraneKick';
import ThunderFocusTea from './modules/spells/ThunderFocusTea';
import Vivify from './modules/spells/Vivify';
import AverageTimeBetweenRSKSs from './modules/talents/AverageTimeBetweenRSKs';
import ChiBurst from './modules/talents/ChiBurst';
import InvokeChiJi from './modules/talents/InvokeChiJi';

// Talents
import JadeSerpentStatue from './modules/talents/JadeSerpentStatue';
import Lifecycles from './modules/talents/Lifecycles';
import ManaTea from './modules/talents/ManaTea';
import RefreshingJadeWind from './modules/talents/RefreshingJadeWind';
import RenewingMistDuringManaTea from './modules/talents/RenewingMistDuringManaTea';
import RisingMist from './modules/talents/RisingMist';
import SpiritOfTheCrane from './modules/talents/SpiritOfTheCrane';
import Tier30Comparison from './modules/talents/Tier30Comparison';
import Upwelling from './modules/talents/Upwelling';

// Mana Tracker

// Potency

// Legendaries
import HotApplicationNormalizer from './normalizers/HotApplicationNormalizer';
import HotRemovalNormalizer from './normalizers/HotRemovalNormalizer';

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
    tier30Comparison: Tier30Comparison,
    upwelling: Upwelling,
    invokeChiJi: InvokeChiJi,

    // Mana Tab
    manaTracker: ManaTracker,
    hpmDetails: MistweaverHealingEfficiencyDetails,
    hpmTracker: HealingEfficiencyTracker,

    // Covenants
    fallenOrder: FallenOrder,
    faelineStomp: FaelineStomp,

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
