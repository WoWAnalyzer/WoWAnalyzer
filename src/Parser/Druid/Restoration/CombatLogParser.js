import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import LowHealthHealing from 'Parser/Core/Modules/Features/LowHealthHealing';
import HealingDone from 'Parser/Core/Modules/HealingDone';

import WildGrowthNormalizer from './Normalizers/WildGrowth';
import ClearcastingNormalizer from './Normalizers/ClearcastingNormalizer';
import HotApplicationNormalizer from './Normalizers/HotApplicationNormalizer';
import TreeOfLifeNormalizer from './Normalizers/TreeOfLifeNormalizer';

import Checklist from './Modules/Features/Checklist';

import Mastery from './Modules/Core/Mastery';
import Rejuvenation from './Modules/Core/Rejuvenation';

import HotTracker from './Modules/Core/HotTracking/HotTracker';
import RejuvenationAttributor from './Modules/Core/HotTracking/RejuvenationAttributor';
import RegrowthAttributor from './Modules/Core/HotTracking/RegrowthAttributor';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import AverageHots from './Modules/Features/AverageHots';
import Abilities from './Modules/Abilities';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import WildGrowth from './Modules/Features/WildGrowth';
import Lifebloom from './Modules/Features/Lifebloom';
import Efflorescence from './Modules/Features/Efflorescence';
import Clearcasting from './Modules/Features/Clearcasting';
import Innervate from './Modules/Features/Innervate';
import Ironbark from './Modules/Features/Ironbark';
import NaturesEssence from './Modules/Features/NaturesEssence';
import ManaUsage from './Modules/Features/ManaUsage';

import CenarionWard from './Modules/Talents/CenarionWard';
import Cultivation from './Modules/Talents/Cultivation';
import Flourish from './Modules/Talents/Flourish';
import SpringBlossoms from './Modules/Talents/SpringBlossoms';
import SoulOfTheForest from './Modules/Talents/SoulOfTheForest';
import TreeOfLife from './Modules/Talents/TreeOfLife';
import Photosynthesis from './Modules/Talents/Photosynthesis';

import FungalEssence from './Modules/Items/AzeriteTraits/FungalEssence';
import AutumnLeaves from './Modules/Items/AzeriteTraits/AutumnLeaves';
import GroveTending from './Modules/Items/AzeriteTraits/GroveTending';
import LaserMatrix from './Modules/Items/AzeriteTraits/LaserMatrixRestoDruid';
import WakingDream from './Modules/Items/AzeriteTraits/WakingDream';
import SynergisticGrowth from './Modules/Items/AzeriteTraits/SynergisticGrowth';

import StatWeights from './Modules/Features/StatWeights';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';


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
    treeOfLife: TreeOfLife,
    photosynthesis: Photosynthesis,
    flourish: Flourish,
    innervate: Innervate,
    soulOfTheForest: SoulOfTheForest,
    springBlossoms: SpringBlossoms,
    cultivation: Cultivation,
    cenarionWard: CenarionWard,
    ironbark: Ironbark,
    naturesEssence: NaturesEssence,
    manaUsage: ManaUsage,
    // Items:

    // Azerite traits
    fungalEssence: FungalEssence,
    autumnLeaves: AutumnLeaves,
    groveTending: GroveTending,
    laserMatrix: LaserMatrix,
    wakingDream: WakingDream,
    synergisticGrowth: SynergisticGrowth,

    statWeights: StatWeights,
  };
}

export default CombatLogParser;
