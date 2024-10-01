import ActiveDruidForm from 'analysis/retail/druid/shared/core/ActiveDruidForm';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';

import Guide from './Guide';
import Abilities from './modules/Abilities';
import HotAttributor from './modules/core/hottracking/HotAttributor';
import HotTrackerRestoDruid from './modules/core/hottracking/HotTrackerRestoDruid';
import Mastery from './modules/core/Mastery';
import SpellManaCost from './modules/core/SpellManaCost';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import AverageHots from './modules/features/AverageHots';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Efflorescence from 'analysis/retail/druid/restoration/modules/spells/Efflorescence';
import HotCountGraph from './modules/features/HotCountGraph';
import Innervate from 'analysis/retail/druid/restoration/modules/spells/Innervate';
import Ironbark from 'analysis/retail/druid/restoration/modules/spells/Ironbark';
import Lifebloom from 'analysis/retail/druid/restoration/modules/spells/Lifebloom';
import LifebloomAndEffloUptime from 'analysis/retail/druid/restoration/modules/spells/LifebloomAndEffloUptime';
import RegrowthAndClearcasting from 'analysis/retail/druid/restoration/modules/spells/RegrowthAndClearcasting';
import Rejuvenation from 'analysis/retail/druid/restoration/modules/spells/Rejuvenation';
import RestoDruidHealingEfficiencyDetails from './modules/features/RestoDruidHealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/RestoDruidHealingEfficiencyTracker';
import Swiftmend from 'analysis/retail/druid/restoration/modules/spells/Swiftmend';
import Tranquility from 'analysis/retail/druid/restoration/modules/spells/Tranquility';
import WildGrowth from 'analysis/retail/druid/restoration/modules/spells/WildGrowth';
import FlashOfClarity from 'analysis/retail/druid/restoration/modules/spells/FlashOfClarity';
import ConvokeSpiritsResto from 'analysis/retail/druid/restoration/modules/spells/ConvokeSpiritsResto';
import Reforestation from 'analysis/retail/druid/restoration/modules/spells/Reforestation';
import PowerOfTheArchdruid from 'analysis/retail/druid/restoration/modules/spells/PowerOfTheArchdruid';
import VerdantInfusion from 'analysis/retail/druid/restoration/modules/spells/VerdantInfusion';
import Abundance from 'analysis/retail/druid/restoration/modules/spells/Abundance';
import CenarionWard from 'analysis/retail/druid/restoration/modules/spells/CenarionWard';
import Cultivation from 'analysis/retail/druid/restoration/modules/spells/Cultivation';
import Flourish from 'analysis/retail/druid/restoration/modules/spells/Flourish';
import Photosynthesis from 'analysis/retail/druid/restoration/modules/spells/Photosynthesis';
import SoulOfTheForest from 'analysis/retail/druid/restoration/modules/spells/SoulOfTheForest';
import SpringBlossoms from 'analysis/retail/druid/restoration/modules/spells/SpringBlossoms';
import TreeOfLife from 'analysis/retail/druid/restoration/modules/spells/TreeOfLife';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';
import ClearcastingNormalizer from './normalizers/ClearcastingNormalizer';
import SoulOfTheForestLinkNormalizer from './normalizers/SoulOfTheForestLinkNormalizer';
import SwiftmendNormalizer from './normalizers/SwiftmendNormalizer';
import TreeOfLifeNormalizer from './normalizers/TreeOfLifeNormalizer';
import GroveTending from 'analysis/retail/druid/restoration/modules/spells/GroveTending';
import HarmoniusBlooming from 'analysis/retail/druid/restoration/modules/spells/HarmoniusBlooming';
import Verdancy from 'analysis/retail/druid/restoration/modules/spells/Verdancy';
import Regenesis from 'analysis/retail/druid/restoration/modules/spells/Regenesis';
import NurturingDormancy from 'analysis/retail/druid/restoration/modules/spells/Nurturing Dormancy';
import NaturesVigil from 'analysis/retail/druid/restoration/modules/spells/NaturesVigil';
import RampantGrowth from 'analysis/retail/druid/restoration/modules/spells/RampantGrowth';
import Overgrowth from 'analysis/retail/druid/restoration/modules/spells/Overgrowth';
import BuddingLeaves from 'analysis/retail/druid/restoration/modules/spells/BuddingLeaves';
import Dreamstate from 'analysis/retail/druid/restoration/modules/spells/Dreamstate';
import WildGrowthPrecastOrderNormalizer from 'analysis/retail/druid/restoration/normalizers/WildGrowthPrecastOrderNormalizer';
import WakingDream from 'analysis/retail/druid/restoration/modules/spells/WakingDream';
import GroveGuardians from 'analysis/retail/druid/restoration/modules/spells/GroveGuardians';
import CenariusGuidanceTol from 'analysis/retail/druid/restoration/modules/spells/CenariusGuidanceTol';
import ControlOfTheDream from 'analysis/retail/druid/shared/spells/ControlOfTheDream';
import Germination from 'analysis/retail/druid/restoration/modules/spells/Germination';
import ThrivingVegetation from 'analysis/retail/druid/restoration/modules/spells/ThrivingVegetation';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizers
    clearcastingNormalizer: ClearcastingNormalizer,
    hotCastLinkNormalizer: CastLinkNormalizer,
    soulOfTheForestLinkNormalizer: SoulOfTheForestLinkNormalizer,
    treeOfLifeNormalizer: TreeOfLifeNormalizer,
    swiftmendNormazlier: SwiftmendNormalizer,
    wildGrowthPrecastOrderNormalizer: WildGrowthPrecastOrderNormalizer,

    // Core
    hotTracker: HotTrackerRestoDruid,
    hotAttributor: HotAttributor,
    mastery: Mastery,
    spellManaCost: SpellManaCost,
    activeDruidForm: ActiveDruidForm,

    // Generic healer things
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,

    // Spells
    lowHealthHealing: LowHealthHealing,
    alwaysBeCasting: AlwaysBeCasting,
    averageHots: AverageHots,
    cooldownThroughputTracker: CooldownThroughputTracker,
    abilities: Abilities,
    wildGrowth: WildGrowth,
    lifebloom: Lifebloom,
    efflorescence: Efflorescence,
    regrowthAndClearcasting: RegrowthAndClearcasting,
    innervate: Innervate,
    springBlossoms: SpringBlossoms,
    cultivation: Cultivation,
    groveTending: GroveTending,
    ironbark: Ironbark,
    rejuvenation: Rejuvenation,
    lifebloomAndEffloUptime: LifebloomAndEffloUptime,
    swiftmend: Swiftmend,
    hotCountGraph: HotCountGraph,
    tranquility: Tranquility,
    soulOfTheForest: SoulOfTheForest,
    treeOfLife: TreeOfLife,
    photosynthesis: Photosynthesis,
    flourish: Flourish,
    cenarionWard: CenarionWard,
    abundance: Abundance,
    convokeSpirits: ConvokeSpiritsResto,
    flashOfClarity: FlashOfClarity,
    memoryoftheMotherTree: PowerOfTheArchdruid,
    verdantInfusion: VerdantInfusion,
    reforestation: Reforestation,
    harmoniusBlooming: HarmoniusBlooming,
    verdancy: Verdancy,
    regenesis: Regenesis,
    nurturingDormancy: NurturingDormancy,
    naturesVigil: NaturesVigil,
    rampantGrowth: RampantGrowth,
    overgrowth: Overgrowth,
    buddingLeaves: BuddingLeaves,
    dreamstate: Dreamstate,
    wakingDream: WakingDream,
    groveGuardians: GroveGuardians,
    cenariusGuidanceTol: CenariusGuidanceTol,
    controlOfTheDream: ControlOfTheDream,
    germination: Germination,
    thrivingVegetation: ThrivingVegetation,

    // Mana Tab
    manaTracker: ManaTracker,
    hpmDetails: RestoDruidHealingEfficiencyDetails,
    hpmTracker: HealingEfficiencyTracker,

    //Tier
  };

  static guide = Guide;
}

export default CombatLogParser;
