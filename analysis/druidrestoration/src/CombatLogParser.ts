import CoreCombatLogParser from 'parser/core/CombatLogParser';
import HealingEfficiencyDetails from 'parser/core/healingEfficiency/HealingEfficiencyDetails';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';

import ActiveDruidForm from '@wowanalyzer/druid/src/core/ActiveDruidForm';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './constants';
import Abilities from './modules/Abilities';
import HotTrackerRestoDruid from './modules/core/hottracking/HotTrackerRestoDruid';
import HotAttributor from './modules/core/hottracking/HotAttributor';
import Mastery from './modules/core/Mastery';
import Rejuvenation from './modules/core/Rejuvenation';
import SpellManaCost from './modules/core/SpellManaCost';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import AverageHots from './modules/features/AverageHots';
import Checklist from './modules/features/Checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Efflorescence from './modules/features/Efflorescence';
import Innervate from './modules/features/Innervate';
import Ironbark from './modules/features/Ironbark';
import Lifebloom from './modules/features/Lifebloom';
import LifebloomAndEffloUptime from './modules/features/LifebloomAndEffloUptime';
import PrematureRejuvenations from './modules/features/PrematureRejuvenations';
import RegrowthAndClearcasting from './modules/features/RegrowthAndClearcasting';
import HealingEfficiencyTracker from './modules/features/RestoDruidHealingEfficiencyTracker';
import StatWeights from './modules/features/StatWeights';
import WildGrowth from './modules/features/WildGrowth';
import ConfluxOfElementsResto from './modules/shadowlands/conduits/ConfluxOfElementsResto';
import EvolvedSwarmResto from './modules/shadowlands/conduits/EvolvedSwarmResto';
import FieldOfBlossomsResto from './modules/shadowlands/conduits/FieldOfBlossomsResto';
import FlashOfClarity from './modules/shadowlands/conduits/FlashOfClarity';
import GroveInvigorationResto from './modules/shadowlands/conduits/GroveInvigorationResto';
import AdaptiveSwarmResto from './modules/shadowlands/covenants/AdaptiveSwarmResto';
import ConvokeSpiritsResto from './modules/shadowlands/covenants/ConvokeSpiritsResto';
import KindredSpiritsResto from './modules/shadowlands/covenants/KindredSpiritsResto';
import MemoryoftheMotherTree from './modules/shadowlands/legendaries/MemoryoftheMotherTree';
import VerdantInfusion from './modules/shadowlands/legendaries/VerdantInfusion';
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

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Normalizers
    clearcastingNormalizer: ClearcastingNormalizer,
    hotApplicationNormalizer: HotApplicationNormalizer,
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
    hotAttributor: HotAttributor,

    // Features
    lowHealthHealing: LowHealthHealing,
    alwaysBeCasting: AlwaysBeCasting,
    averageHots: AverageHots,
    cooldownThroughputTracker: CooldownThroughputTracker,
    abilities: Abilities,
    wildGrowth: WildGrowth,
    lifebloom: Lifebloom,
    efflorescence: Efflorescence,
    clearcasting: RegrowthAndClearcasting,
    innervate: Innervate,
    springBlossoms: SpringBlossoms,
    cultivation: Cultivation,
    ironbark: Ironbark,
    prematureRejuvenations: PrematureRejuvenations,
    lifebloomAndEffloUptime: LifebloomAndEffloUptime,

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
    convokeSpirits: ConvokeSpiritsResto,
    adaptiveSwarm: AdaptiveSwarmResto,
    kindredSpirits: KindredSpiritsResto,

    // Conduits
    // Potency
    flashOfClarity: FlashOfClarity,
    evolvedSwarmResto: EvolvedSwarmResto,
    confluxOfElementsResto: ConfluxOfElementsResto,
    // Soulbind
    groveInvigoration: GroveInvigorationResto,
    fieldOfBlossoms: FieldOfBlossomsResto,

    //legos
    visionOfUnendingGrowrth: VisionOfUnendingGrowrth,
    memoryoftheMotherTree: MemoryoftheMotherTree,
    verdantInfusion: VerdantInfusion,
  };
}

export default CombatLogParser;
