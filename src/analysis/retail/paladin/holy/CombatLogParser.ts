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
import MightOfTheMountain from './modules/racials/MightOfTheMountain';
import UntemperedDedication from './modules/talents/UntemperedDedication';
import MaraadsCastRatio from './modules/talents/MaraadsCastRatio';
import MaraadsOverheal from './modules/talents/MaraadsOverheal';
import DevotionAuraDamageReduction from './modules/spells/DevotionAuraDamageReduction';
import FillerFlashOfLight from './modules/spells/FillerFlashOfLight';
import FillerLightOfTheMartyrs from './modules/spells/FillerLightOfTheMartyrs';
import InefficientLightOfTheMartyrs from './modules/spells/InefficientLightOfTheMartyrs';
import LightOfDawn from './modules/spells/LightOfDawn';
import AvengingCrusader from './modules/talents/AvengingCrusader';
import CrusadersMight from './modules/talents/CrusadersMight';
import GlimmerOfLight from './modules/talents/GlimmerOfLight';
import JudgmentOfLight from './modules/talents/JudgmentOfLight';
import RuleOfLaw from './modules/talents/RuleOfLaw';
import BeaconOfVirtueNormalizer from './normalizers/BeaconOfVirtue';
import LightOfDawnNormalizer from './normalizers/LightOfDawn';
import { BlessingOfTheSeasons } from './modules/talents/BlessingOfTheSeasons';
import T30HpalTierSet from './modules/dragonflight/tier/T30TierSet';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';

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
    fillerLightOfTheMartyrs: FillerLightOfTheMartyrs,
    inefficientLightOfTheMartyrs: InefficientLightOfTheMartyrs,
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
    mightOfTheMountain: MightOfTheMountain,

    // Talents
    ruleOfLaw: RuleOfLaw,
    devotionAuradamageReduction: DevotionAuraDamageReduction,
    divinePurpose: DivinePurpose,
    crusadersMight: CrusadersMight,
    avengingCrusader: AvengingCrusader,
    judgmentOfLight: JudgmentOfLight,
    glimmerOfLight: GlimmerOfLight,
    MaraadsCastRatio: MaraadsCastRatio,
    MaraadsOverheal: MaraadsOverheal,
    divineToll: DivineToll,
    UntemperedDedication: UntemperedDedication,
    blessingOfTheSeasons: BlessingOfTheSeasons,

    // HolyPower
    holyPowerTracker: HolyPowerTracker,
    holyPowerDetails: HolyPowerDetails,
    holyPowerPerMinute: HolyPowerPerMinute,

    // Tier Sets
    t30TierSet: T30HpalTierSet,
  };
}

export default CombatLogParser;
