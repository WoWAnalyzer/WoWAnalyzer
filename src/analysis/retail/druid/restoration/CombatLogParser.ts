import ActiveDruidForm from 'analysis/retail/druid/shared/core/ActiveDruidForm';
import DraughtOfDeepFocus from 'analysis/retail/druid/shared/spells/DraughtOfDeepFocus';
import RavenousFrenzy from 'analysis/retail/druid/shared/spells/RavenousFrenzy';
import { SinfulHysteria } from 'analysis/retail/druid/shared';
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
import Checklist from './modules/features/Checklist/Module';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Efflorescence from './modules/features/Efflorescence';
import HotCountGraph from './modules/features/HotCountGraph';
import Innervate from './modules/features/Innervate';
import Ironbark from './modules/features/Ironbark';
import Lifebloom from './modules/features/Lifebloom';
import LifebloomAndEffloUptime from './modules/features/LifebloomAndEffloUptime';
import RegrowthAndClearcasting from './modules/features/RegrowthAndClearcasting';
import Rejuvenation from './modules/features/Rejuvenation';
import RestoDruidHealingEfficiencyDetails from './modules/features/RestoDruidHealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/RestoDruidHealingEfficiencyTracker';
import StatWeights from './modules/features/StatWeights';
import Swiftmend from './modules/features/Swiftmend';
import Tranquility from './modules/features/Tranquility';
import WildGrowth from './modules/features/WildGrowth';
import AdaptiveArmorFragment from './modules/shadowlands/conduits/AdaptiveArmorFragment';
import ConfluxOfElementsResto from './modules/shadowlands/conduits/ConfluxOfElementsResto';
import EvolvedSwarmResto from './modules/shadowlands/conduits/EvolvedSwarmResto';
import FieldOfBlossomsResto from './modules/shadowlands/conduits/FieldOfBlossomsResto';
import FlashOfClarity from 'analysis/retail/druid/restoration/modules/spells/FlashOfClarity';
import GroveInvigorationResto from './modules/shadowlands/conduits/GroveInvigorationResto';
import AdaptiveSwarmResto from 'analysis/retail/druid/restoration/modules/spells/AdaptiveSwarmResto';
import ConvokeSpiritsResto from 'analysis/retail/druid/restoration/modules/spells/ConvokeSpiritsResto';
import KindredSpiritsResto from './modules/shadowlands/covenants/KindredSpiritsResto';
import Tier28_2pc from './modules/shadowlands/items/Tier28_2pc';
import Reforestation from './modules/shadowlands/items/Tier28_4pc';
import LycarasFleetingGlimpseResto from './modules/shadowlands/legendaries/LycarasFleetingGlimpseResto';
import PowerOfTheArchdruid from 'analysis/retail/druid/restoration/modules/spells/PowerOfTheArchdruid';
import VerdantInfusion from 'analysis/retail/druid/restoration/modules/spells/VerdantInfusion';
import VisionOfUnendingGrowrth from './modules/shadowlands/legendaries/VisionOfUnendingGrowth';
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
import HotApplicationNormalizer from './normalizers/HotApplicationNormalizer';
import SoulOfTheForestLinkNormalizer from './normalizers/SoulOfTheForestLinkNormalizer';
import SwiftmendNormalizer from './normalizers/SwiftmendNormalizer';
import TreeOfLifeNormalizer from './normalizers/TreeOfLifeNormalizer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizers
    clearcastingNormalizer: ClearcastingNormalizer,
    hotApplicationNormalizer: HotApplicationNormalizer,
    hotCastLinkNormalizer: CastLinkNormalizer,
    soulOfTheForestLinkNormalizer: SoulOfTheForestLinkNormalizer,
    treeOfLifeNormalizer: TreeOfLifeNormalizer,
    swiftmendNormazlier: SwiftmendNormalizer,

    // Core
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
    regrowthAndClearcasting: RegrowthAndClearcasting,
    innervate: Innervate,
    springBlossoms: SpringBlossoms,
    cultivation: Cultivation,
    ironbark: Ironbark,
    prematureRejuvenations: Rejuvenation,
    lifebloomAndEffloUptime: LifebloomAndEffloUptime,
    swiftmend: Swiftmend,
    hotCountGraph: HotCountGraph,
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
    hpmDetails: RestoDruidHealingEfficiencyDetails,
    hpmTracker: HealingEfficiencyTracker,

    // Covenants
    convokeSpirits: ConvokeSpiritsResto,
    adaptiveSwarm: AdaptiveSwarmResto,
    kindredSpirits: KindredSpiritsResto,
    sinfulHysteria: SinfulHysteria,
    ravenousFrenzy: RavenousFrenzy,

    // Conduits
    // Potency
    flashOfClarity: FlashOfClarity,
    evolvedSwarmResto: EvolvedSwarmResto,
    confluxOfElementsResto: ConfluxOfElementsResto,
    adaptiveArmorFragment: AdaptiveArmorFragment,
    // Soulbind
    groveInvigoration: GroveInvigorationResto,
    fieldOfBlossoms: FieldOfBlossomsResto,

    //legos
    visionOfUnendingGrowrth: VisionOfUnendingGrowrth,
    memoryoftheMotherTree: PowerOfTheArchdruid,
    verdantInfusion: VerdantInfusion,
    lycarasFleetingGlimpse: LycarasFleetingGlimpseResto,
    draughtOfDeepFocus: DraughtOfDeepFocus,

    // sets
    tier28_2pc: Tier28_2pc,
    tier28_4pc: Reforestation,
  };

  static guide = Guide;
}

export default CombatLogParser;
