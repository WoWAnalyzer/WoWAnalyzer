import CoreCombatLogParser from 'parser/core/CombatLogParser';
import HealingEfficiencyDetails from 'parser/core/healingEfficiency/HealingEfficiencyDetails';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';

import { ConvokeSpirits } from '@wowanalyzer/druid';
import ActiveDruidForm from '@wowanalyzer/druid/src/core/ActiveDruidForm';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './constants';
import Abilities from './modules/Abilities';
import HotTrackerRestoDruid from './modules/core/hottracking/HotTrackerRestoDruid';
import RegrowthAttributor from './modules/core/hottracking/RegrowthAttributor';
import RejuvenationAttributor from './modules/core/hottracking/RejuvenationAttributor';
import Mastery from './modules/core/Mastery';
import Rejuvenation from './modules/core/Rejuvenation';
import SpellManaCost from './modules/core/SpellManaCost';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import AverageHots from './modules/features/AverageHots';
import Checklist from './modules/features/Checklist/Module';
import Clearcasting from './modules/features/Clearcasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Efflorescence from './modules/features/Efflorescence';
import Innervate from './modules/features/Innervate';
import Ironbark from './modules/features/Ironbark';
import Lifebloom from './modules/features/Lifebloom';
import PrematureRejuvenations from './modules/features/PrematureRejuvenations';
import HealingEfficiencyTracker from './modules/features/RestoDruidHealingEfficiencyTracker';
import StatWeights from './modules/features/StatWeights';
import Tranquility from './modules/features/Tranquility';
import WildGrowth from './modules/features/WildGrowth';
import EvolvedSwarmResto from './modules/shadowlands/conduits/EvolvedSwarmResto';
import FlashOfClarity from './modules/shadowlands/conduits/FlashOfClarity';
import AdaptiveSwarmResto from './modules/shadowlands/covenants/AdaptiveSwarmResto';
import MemoryoftheMotherTree from './modules/shadowlands/legendaries/MemoryoftheMotherTree';
import VisionOfUnendingGrowrth from './modules/shadowlands/legendaries/VisionOfUnendingGrowth';
import Abundance from './modules/talents/Abundance';
import CenarionWard from './modules/talents/CenarionWard';
import Cultivation from './modules/talents/Cultivation';
import Flourish from './modules/talents/Flourish';
import Photosynthesis from './modules/talents/Photosynthesis';
import SoulOfTheForest from './modules/talents/SoulOfTheForest';
import SpringBlossoms from './modules/talents/SpringBlossoms';
import TreeOfLife from './modules/talents/TreeOfLife';
import ClearcastingNormalizer from './normalizers/ClearcastingNormalizer';
import HotApplicationNormalizer from './normalizers/HotApplicationNormalizer';
import TreeOfLifeNormalizer from './normalizers/TreeOfLifeNormalizer';
import WildGrowthNormalizer from './normalizers/WildGrowth';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Normalizers
    wildGrowthNormalizer: WildGrowthNormalizer,
    clearcastingNormalizer: ClearcastingNormalizer,
    hotApplicationNormalizer: HotApplicationNormalizer, // this needs to be loaded after potaNormalizer, as potaNormalizer can sometimes unfix the events if loaded before...
    treeOfLifeNormalizer: TreeOfLifeNormalizer,

    // Core
    rejuvenation: Rejuvenation,
    mastery: Mastery,
    spellManaCost: SpellManaCost,
    activeDruidForm: ActiveDruidForm,

    // Generic healer things
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,

    // Checklist
    checklist: Checklist,

    // Hot Tracking
    hotTracker: HotTrackerRestoDruid,
    rejuvenationAttributor: RejuvenationAttributor,
    regrowthAttributor: RegrowthAttributor,

    // Features
    lowHealthHealing: LowHealthHealing,
    alwaysBeCasting: AlwaysBeCasting,
    averageHots: AverageHots,
    cooldownThroughputTracker: CooldownThroughputTracker,
    abilities: Abilities,
    wildGrowth: WildGrowth,
    lifebloom: Lifebloom,
    efflorescence: Efflorescence,
    clearcasting: Clearcasting,
    innervate: Innervate,
    springBlossoms: SpringBlossoms,
    cultivation: Cultivation,
    ironbark: Ironbark,
    prematureRejuvenations: PrematureRejuvenations,
    tranquility: Tranquility,

    // Talents
    soulOfTheForest: SoulOfTheForest,
    treeOfLife: TreeOfLife,
    photosynthesis: Photosynthesis,
    flourish: Flourish,
    cenarionWard: CenarionWard,
    abundance: Abundance,

    //stat weights
    statWeights: StatWeights,

    // Mana Tab
    manaTracker: ManaTracker,
    hpmDetails: HealingEfficiencyDetails,
    hpmTracker: HealingEfficiencyTracker,

    // Covenants
    convokeSpirits: ConvokeSpirits,
    adaptiveSwarm: AdaptiveSwarmResto,

    // Conduits
    // Potency
    flashOfClarity: FlashOfClarity,
    evolvedSwarmResto: EvolvedSwarmResto,

    //legos
    visionOfUnendingGrowrth: VisionOfUnendingGrowrth,
    memoryoftheMotherTree: MemoryoftheMotherTree,
  };
}

export default CombatLogParser;
