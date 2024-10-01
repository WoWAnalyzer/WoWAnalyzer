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
import Checklist from './modules/checklist/Module';
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
import JudgmentOfLight from './modules/talents/JudgmentOfLight';
import BeaconOfVirtueNormalizer from './normalizers/BeaconOfVirtue';
import LightOfDawnNormalizer from './normalizers/LightOfDawn';
import { BlessingOfTheSeasons } from './modules/talents/BlessingOfTheSeasons';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';
import AverageLODDistance from './modules/spells/AverageLODDistance';
import ImbuedInfusion from './modules/talents/ImbuedInfusion';
import HolyPrism from './modules/talents/HolyPrism';
import ELConsumedBuffs from './modules/talents/EmpyreanLegacy/ConsumedBuffs';
import ELPossibleBuffs from './modules/talents/EmpyreanLegacy/PossibleBuffs';
import TirionsDevotion from './modules/talents/TirionsDevotion';
import Reclamation from './modules/talents/Reclamation';
import TyrsDeliverance from './modules/talents/TyrsDeliverance/TyrsDeliverance';
import BoundlessSalvation from './modules/talents/TyrsDeliverance/BoundlessSalvation';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import HealingEfficiencyDetails from 'parser/core/healingEfficiency/HealingEfficiencyDetails';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import HolyPaladinHealingEfficiencyTracker from './modules/features/HolyPaladinHealingEfficiencyTracker';
import HolyShock from './modules/talents/HolyShock';
import BeaconOfVirtue from './modules/talents/BeaconOfVirtue';
import HolyPowerGraph from './modules/core/HolyPowerGraph';
import OverflowingLight from './modules/talents/OverflowingLight';
import Guide from './guide/Guide';

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

    // Features
    checklist: Checklist,
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
    judgmentOfLight: JudgmentOfLight,
    divineToll: DivineToll,
    blessingOfTheSeasons: BlessingOfTheSeasons,
    averageLODDistance: AverageLODDistance,
    imbuedInfusion: ImbuedInfusion,
    holyPrism: HolyPrism,
    elConsumedBuffs: ELConsumedBuffs,
    elPossibleBuffs: ELPossibleBuffs,
    tirionsDevotion: TirionsDevotion,
    reclamation: Reclamation,
    tyrsDeliverance: TyrsDeliverance,
    boundlessSalvation: BoundlessSalvation,
    holyShock: HolyShock,
    beaconOfVirtue: BeaconOfVirtue,
    overflowingLight: OverflowingLight,

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
