import CoreCombatLogParser from 'parser/core/CombatLogParser';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import HealingDone from 'parser/shared/modules/HealingDone';

import WildGrowthNormalizer from './normalizers/WildGrowth';
import ClearcastingNormalizer from './normalizers/ClearcastingNormalizer';
import HotApplicationNormalizer from './normalizers/HotApplicationNormalizer';
import TreeOfLifeNormalizer from './normalizers/TreeOfLifeNormalizer';

import Checklist from './modules/features/Checklist/Module';

import Mastery from './modules/core/Mastery';
import Rejuvenation from './modules/core/Rejuvenation';

import HotTracker from './modules/core/hottracking/HotTracker';
import RejuvenationAttributor from './modules/core/hottracking/RejuvenationAttributor';
import RegrowthAttributor from './modules/core/hottracking/RegrowthAttributor';
import RestoDruidAbilityTracker from './modules/core/RestoDruidAbilityTracker';
import SpellManaCost from './modules/core/SpellManaCost';

import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import AverageHots from './modules/features/AverageHots';
import Abilities from './modules/Abilities';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import WildGrowth from './modules/features/WildGrowth';
import Lifebloom from './modules/features/Lifebloom';
import Efflorescence from './modules/features/Efflorescence';
import Clearcasting from './modules/features/Clearcasting';
import Innervate from './modules/features/Innervate';
import Ironbark from './modules/features/Ironbark';
import ManaUsage from './modules/features/ManaUsage';
import HPMTracker from './modules/features/HPMTracker';
import PrematureRejuvenations from './modules/features/PrematureRejuvenations';

import CenarionWard from './modules/talents/CenarionWard';
import Cultivation from './modules/talents/Cultivation';
import Flourish from './modules/talents/Flourish';
import SpringBlossoms from './modules/talents/SpringBlossoms';
import SoulOfTheForest from './modules/talents/SoulOfTheForest';
import TreeOfLife from './modules/talents/TreeOfLife';
import Photosynthesis from './modules/talents/Photosynthesis';
import Stonebark from './modules/talents/Stonebark';
import Abundance from './modules/talents/Abundance';

import FungalEssence from './modules/items/azeritetraits/FungalEssence';
import AutumnLeaves from './modules/items/azeritetraits/AutumnLeaves';
import GroveTending from './modules/items/azeritetraits/GroveTending';
import LaserMatrix from './modules/items/azeritetraits/LaserMatrixRestoDruid';
import WakingDream from './modules/items/azeritetraits/WakingDream';
import LivelySpirit from './modules/items/azeritetraits/LivelySpirit';
import RampantGrowth from './modules/items/azeritetraits/RampantGrowth';

import StatWeights from './modules/features/StatWeights';

// Mana Tracker
import HealingEfficiencyDetails from '../../core/healingEfficiency/HealingEfficiencyDetails';
import HealingEfficiencyTracker from '../../core/healingEfficiency/HealingEfficiencyTracker';
import ManaTracker from '../../core/healingEfficiency/ManaTracker';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './constants';


class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Normalizers
    wildGrowthNormalizer: WildGrowthNormalizer,
    clearcastingNormalizer: ClearcastingNormalizer,
    hotApplicationNormalizer: HotApplicationNormalizer, // this needs to be loaded after potaNormalizer, as potaNormalizer can sometimes unfix the events if loaded before...
    treeOfLifeNormalizer: TreeOfLifeNormalizer,

    // Core
    healingDone: [HealingDone, { showStatistic: true }],
    rejuvenation: Rejuvenation,
    mastery: Mastery,
    restoDruidAbilityTracker: RestoDruidAbilityTracker,
    spellManaCost: SpellManaCost,

    // Checklist
    checklist: Checklist,

    // Hot Tracking
    hotTracker: HotTracker,
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
    manaUsage: ManaUsage,
    prematureRejuvenations: PrematureRejuvenations,
    hpmTracker: HPMTracker,

    // Talents
    stonebark: Stonebark,
    soulOfTheForest: SoulOfTheForest,
    treeOfLife: TreeOfLife,
    photosynthesis: Photosynthesis,
    flourish: Flourish,
    cenarionWard: CenarionWard,
    abundance: Abundance,

    // Items:

    // Azerite traits
    fungalEssence: FungalEssence,
    autumnLeaves: AutumnLeaves,
    groveTending: GroveTending,
    laserMatrix: LaserMatrix,
    wakingDream: WakingDream,
    livelySpirit: LivelySpirit,
    rampantGrowth: RampantGrowth,

    statWeights: StatWeights,

    // Mana Tab
    manaTracker: ManaTracker,
    hpmDetails: HealingEfficiencyDetails,
    hpmTracker2: HealingEfficiencyTracker,
  };
}

export default CombatLogParser;
