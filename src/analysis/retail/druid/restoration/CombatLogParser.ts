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
import ConvokeSpiritsResto from 'analysis/retail/druid/restoration/modules/spells/ConvokeSpiritsResto';
import Reforestation from 'analysis/retail/druid/restoration/modules/spells/Reforestation';
import PowerOfTheArchdruid from 'analysis/retail/druid/restoration/modules/spells/PowerOfTheArchdruid';
import VerdantInfusion from 'analysis/retail/druid/restoration/modules/spells/VerdantInfusion';
import Abundance from 'analysis/retail/druid/restoration/modules/spells/Abundance';
import Flourish from 'analysis/retail/druid/restoration/modules/spells/Flourish';
import Photosynthesis from 'analysis/retail/druid/restoration/modules/spells/Photosynthesis';
import SoulOfTheForest from 'analysis/retail/druid/restoration/modules/spells/SoulOfTheForest';
import TreeOfLife from 'analysis/retail/druid/restoration/modules/spells/TreeOfLife';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';
import ClearcastingNormalizer from './normalizers/ClearcastingNormalizer';
import SoulOfTheForestLinkNormalizer from './normalizers/SoulOfTheForestLinkNormalizer';
import SwiftmendNormalizer from './normalizers/SwiftmendNormalizer';
import TreeOfLifeNormalizer from './normalizers/TreeOfLifeNormalizer';
import HarmoniusBlooming from 'analysis/retail/druid/restoration/modules/spells/HarmoniusBlooming';
import Verdancy from 'analysis/retail/druid/restoration/modules/spells/Verdancy';
import Regenesis from 'analysis/retail/druid/restoration/modules/spells/Regenesis';
import NurturingDormancy from 'analysis/retail/druid/restoration/modules/spells/NurturingDormancy';
import RampantGrowth from 'analysis/retail/druid/restoration/modules/spells/RampantGrowth';
import WildGrowthPrecastOrderNormalizer from 'analysis/retail/druid/restoration/normalizers/WildGrowthPrecastOrderNormalizer';
import WakingDream from 'analysis/retail/druid/restoration/modules/spells/WakingDream';
import GroveGuardians from 'analysis/retail/druid/restoration/modules/spells/GroveGuardians';
import WildSynthesis from 'analysis/retail/druid/restoration/modules/spells/WildSynthesis';
import CenariusGuidanceTol from 'analysis/retail/druid/restoration/modules/spells/CenariusGuidanceTol';
import ControlOfTheDream from 'analysis/retail/druid/shared/spells/ControlOfTheDream';
import Germination from 'analysis/retail/druid/restoration/modules/spells/Germination';
import ThrivingVegetation from 'analysis/retail/druid/restoration/modules/spells/ThrivingVegetation';
import RenewingSurge from 'analysis/retail/druid/restoration/modules/spells/RenewingSurge';
import RootNetwork from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/RootNetwork';
import Everbloom from 'analysis/retail/druid/restoration/modules/spells/Everbloom';
import ImprovedWildGrowth from 'analysis/retail/druid/restoration/modules/spells/ImprovedWildGrowth';
import ProtectiveGrowth from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/ProtectiveGrowth';
import GrovesInspiration from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/GrovesInspiration';
import CenariusMight from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/CenariusMight';
import PowerOfNature from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/PowerOfNature';
import DryadsDance from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/DryadsDance';
import BounteousBloom from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/BounteousBloom';
import EarlySpring from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/EarlySpring';
import PowerOfTheDream from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/PowerOfTheDream';
import HarmonyOfTheGrove from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/HarmonyOfTheGrove';
import PotentEnchantments from 'analysis/retail/druid/restoration/modules/spells/KeeperOfTheGrove/PotentEnchantments';
import HuntBeneathTheOpenSkies from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/HuntBeneathTheOpenSkies';
import StrategicInfusion from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/StrategicInfusion';
import WildstalkersPower from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/WildstalkersPower';
import HarmoniousConstitution from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/HarmoniousConstitution';
import BondWithNature from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/BondWithNature';
import PatientCustodian from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/PatientCustodian';
import VigorousCreepers from 'analysis/retail/druid/restoration/modules/spells/Wildstalker/VigorousCreepers';
import Liveliness from 'analysis/retail/druid/restoration/modules/spells/Liveliness';
import S1TierSet from 'analysis/retail/druid/restoration/modules/tier/S1TierSet';

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
    everbloom: Everbloom,
    lifebloom: Lifebloom,
    efflorescence: Efflorescence,
    regrowthAndClearcasting: RegrowthAndClearcasting,
    innervate: Innervate,
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
    abundance: Abundance,
    convokeSpirits: ConvokeSpiritsResto,
    memoryoftheMotherTree: PowerOfTheArchdruid,
    verdantInfusion: VerdantInfusion,
    reforestation: Reforestation,
    harmoniusBlooming: HarmoniusBlooming,
    verdancy: Verdancy,
    regenesis: Regenesis,
    nurturingDormancy: NurturingDormancy,
    rampantGrowth: RampantGrowth,
    wakingDream: WakingDream,
    groveGuardians: GroveGuardians,
    wildSynthesis: WildSynthesis,
    cenariusGuidanceTol: CenariusGuidanceTol,
    controlOfTheDream: ControlOfTheDream,
    germination: Germination,
    thrivingVegetation: ThrivingVegetation,
    renewingSurge: RenewingSurge,
    improvedWildGrowth: ImprovedWildGrowth,
    powerOfTheDream: PowerOfTheDream,
    liveliness: Liveliness,

    // Keeper of the Grove
    protectiveGrowth: ProtectiveGrowth,
    cenariusMight: CenariusMight,
    powerOfNature: PowerOfNature,
    grovesInspiration: GrovesInspiration,
    dryadsDance: DryadsDance,
    bounteousBloom: BounteousBloom,
    earlySpring: EarlySpring,
    harmonyOfTheGrove: HarmonyOfTheGrove,
    potentEnchantments: PotentEnchantments,

    // Wildstalker
    rootNetwork: RootNetwork,
    huntBeneathTheOpenSkies: HuntBeneathTheOpenSkies,
    strategicInfusion: StrategicInfusion,
    wildstalkersPower: WildstalkersPower,
    harmoniousConstitution: HarmoniousConstitution,
    bondWithNature: BondWithNature,
    patientCustodian: PatientCustodian,
    vigorousCreepers: VigorousCreepers,

    // Mana Tab
    manaTracker: ManaTracker,
    hpmDetails: RestoDruidHealingEfficiencyDetails,
    hpmTracker: HealingEfficiencyTracker,

    // Tier Set Modules
    s1TierSet: S1TierSet,
  };

  static guide = Guide;
}

export default CombatLogParser;
