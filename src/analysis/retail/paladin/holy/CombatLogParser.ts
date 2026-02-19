import {
  HammerOfWrath,
  DivinePurpose,
  HolyPowerTracker,
  HolyPowerDetails,
  DivineToll,
  HolyPowerPerMinute,
} from 'analysis/retail/paladin/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';

import BeaconHealingDone from './modules/beacons/BeaconHealingDone';
import BeaconHealSource from './modules/beacons/BeaconHealSource';
import BeaconTargets from './modules/beacons/BeaconTargets';
import BeaconTransferFactor from './modules/beacons/BeaconTransferFactor';
import BeaconUptime from './modules/beacons/BeaconUptime';
import DirectBeaconHealing from './modules/beacons/DirectBeaconHealing';
import FailedBeaconTransfers from './modules/beacons/FailedBeaconTransfers';
import MissingBeacons from './modules/beacons/MissingBeacons';
import PaladinAbilityTracker from './modules/core/PaladinAbilityTracker';
import Abilities from './modules/features/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CastBehavior from './modules/features/CastBehavior';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import HealingPerHolyPower from './modules/features/HealingPerHolyPower';
import MasteryEffectiveness from './modules/features/MasteryEffectiveness';
import Overhealing from './modules/features/Overhealing';
import CritRacial from './modules/racials/CritRacial';
import DevotionAuraDamageReduction from './modules/spells/DevotionAuraDamageReduction';
import FillerFlashOfLight from './modules/spells/FillerFlashOfLight';
import LightOfDawn from './modules/spells/LightOfDawn';
import AvengingCrusader from './modules/talents/AvengingCrusader';
import CrusadersMight from './modules/talents/CrusadersMight';
import BeaconOfVirtueNormalizer from './normalizers/BeaconOfVirtue';
import LightOfDawnNormalizer from './normalizers/LightOfDawn';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';
import AverageLODDistance from './modules/spells/AverageLODDistance';
import ImbuedInfusion from './modules/talents/ImbuedInfusion';
import HolyPrism from './modules/talents/HolyPrism';
import EmpyreanLegacy from './modules/talents/EmpyreanLegacy';
import TirionsDevotion from './modules/talents/TirionsDevotion';
import Reclamation from './modules/talents/Reclamation';
import TyrsDeliverance from './modules/talents/TyrsDeliverance/TyrsDeliverance';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import HealingEfficiencyDetails from 'parser/core/healingEfficiency/HealingEfficiencyDetails';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import HolyPaladinHealingEfficiencyTracker from './modules/features/HolyPaladinHealingEfficiencyTracker';
import HolyShock from './modules/talents/HolyShock';
import Judgment from './modules/talents/Judgment';
import BeaconOfVirtue from './modules/talents/BeaconOfVirtue';
import HolyPowerGraph from './modules/core/HolyPowerGraph';
import BuilderUse from './modules/core/BuilderUse';
import OverflowingLight from './modules/talents/OverflowingLight';
import ProtectionOfTyr from './modules/talents/ProtectionOfTyr';
import RisingSunlight from './modules/talents/RisingSunlight';
import Guide from './guide/Guide';

import Aurora from './modules/heroTalents/herald/Aurora';
import BlessingOfAnshe from './modules/heroTalents/herald/BlessingOfAnshe';
import Dawnlight from './modules/heroTalents/herald/Dawnlight';
import GleamingRays from './modules/heroTalents/herald/GleamingRays';
import SecondSunrise from './modules/heroTalents/herald/SecondSunrise';
import SolarGrace from './modules/heroTalents/herald/SolarGrace';
import BlessedAssurance from './modules/heroTalents/lightsmith/BlessedAssurance';
import DivineGuidance from './modules/heroTalents/lightsmith/DivineGuidance';
import HolyArmaments from './modules/heroTalents/lightsmith/HolyArmaments';
import LayingDownArms from './modules/heroTalents/lightsmith/LayingDownArms';
import Valiance from './modules/heroTalents/lightsmith/Valiance';

import Lightbearer from '../shared/Lightbearer';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Normalizers
    lightOfDawnNormalizer: LightOfDawnNormalizer,
    beaconOfVirtueNormalizer: BeaconOfVirtueNormalizer,
    castLinkNormalizer: CastLinkNormalizer,

    // Override the ability tracker so we also get stats for IoL and beacon healing
    abilityTracker: PaladinAbilityTracker,
    lowHealthHealing: LowHealthHealing,

    // PaladinCore
    beaconTransferFactor: BeaconTransferFactor,
    beaconHealSource: BeaconHealSource,
    beaconHealingDone: BeaconHealingDone,
    beaconTargets: BeaconTargets,
    missingBeacons: MissingBeacons,
    failedBeaconTransfers: FailedBeaconTransfers,
    directBeaconHealing: DirectBeaconHealing,
    beaconUptime: BeaconUptime,
    castBehavior: CastBehavior,
    overhealing: Overhealing,
    fillerFlashOfLight: FillerFlashOfLight,
    lightOfDawn: LightOfDawn,
    hammerOfWrath: HammerOfWrath,
    builderUse: BuilderUse,

    // Features
    abilities: Abilities,
    buffs: Buffs,
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    healingPerHolyPower: HealingPerHolyPower,

    // Racials
    critRacial: CritRacial,

    // Talents
    devotionAuradamageReduction: DevotionAuraDamageReduction,
    divinePurpose: DivinePurpose,
    crusadersMight: CrusadersMight,
    avengingCrusader: AvengingCrusader,
    divineToll: DivineToll,
    averageLODDistance: AverageLODDistance,
    imbuedInfusion: ImbuedInfusion,
    holyPrism: HolyPrism,
    empyreanLegacy: EmpyreanLegacy,
    tirionsDevotion: TirionsDevotion,
    reclamation: Reclamation,
    tyrsDeliverance: TyrsDeliverance,
    holyShock: HolyShock,
    judgment: Judgment,
    beaconOfVirtue: BeaconOfVirtue,
    overflowingLight: OverflowingLight,
    protectionOfTyr: ProtectionOfTyr,
    lightBearer: Lightbearer,
    risingSunlight: RisingSunlight,

    // Hero Talents
    // Herald
    aurora: Aurora,
    blessingOfAnshe: BlessingOfAnshe,
    dawnlight: Dawnlight,
    gleamingRays: GleamingRays,
    secondSunrise: SecondSunrise,
    solarGrace: SolarGrace,
    // Lightsmith
    blessedAssurance: BlessedAssurance,
    divineGuidance: DivineGuidance,
    holyArmaments: HolyArmaments,
    layingDownArms: LayingDownArms,
    valiance: Valiance,

    // HolyPower
    holyPowerTracker: HolyPowerTracker,
    holyPowerDetails: HolyPowerDetails,
    holyPowerPerMinute: HolyPowerPerMinute,
    holyPowerGraph: HolyPowerGraph,

    // Mana Tab
    spellManaCost: SpellManaCost,
    manaTracker: ManaTracker,
    hpmTracker: HolyPaladinHealingEfficiencyTracker,
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,
    hpmDetails: HealingEfficiencyDetails,

    // Tier Sets
  };
  static guide = Guide;
}

export default CombatLogParser;
