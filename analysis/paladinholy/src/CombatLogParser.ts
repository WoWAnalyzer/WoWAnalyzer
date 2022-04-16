import CoreCombatLogParser from 'parser/core/CombatLogParser';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';

import {
  HammerOfWrath,
  HolyAvenger,
  DivinePurpose,
  HolyPowerTracker,
  HolyPowerDetails,
  AshenHallow,
  DivineToll,
  HolyPowerPerMinute,
} from '@wowanalyzer/paladin';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './constants';
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
import MasteryEffectiveness from './modules/features/MasteryEffectiveness';
import Overhealing from './modules/features/Overhealing';
import MightOfTheMountain from './modules/racials/MightOfTheMountain';
import UntemperedDedication from './modules/shadowlands/conduits/UntemperedDedication';
import MaraadsCastRatio from './modules/shadowlands/legendaries/MaraadsCastRatio';
import MaraadsOverheal from './modules/shadowlands/legendaries/MaraadsOverheal';
import ShockBarrier from './modules/shadowlands/legendaries/ShockBarrier';
import Tier28FourSet from './modules/shadowlands/tier/Tier28FourSet';
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

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Normalizers
    lightOfDawnNormalizer: LightOfDawnNormalizer,
    beaconOfVirtueNormalizer: BeaconOfVirtueNormalizer,

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

    // Racials
    mightOfTheMountain: MightOfTheMountain,

    // Talents
    ruleOfLaw: RuleOfLaw,
    devotionAuradamageReduction: DevotionAuraDamageReduction,
    holyAvenger: HolyAvenger,
    divinePurpose: DivinePurpose,
    crusadersMight: CrusadersMight,
    avengingCrusader: AvengingCrusader,
    judgmentOfLight: JudgmentOfLight,
    glimmerOfLight: GlimmerOfLight,

    // HolyPower
    holyPowerTracker: HolyPowerTracker,
    holyPowerDetails: HolyPowerDetails,
    holyPowerPerMinute: HolyPowerPerMinute,

    //-- shadowlands section --//
    // Lego
    MaraadsCastRatio: MaraadsCastRatio,
    MaraadsOverheal: MaraadsOverheal,
    shockBarrier: ShockBarrier,

    // Covenant
    ashenHallow: AshenHallow,
    divineToll: DivineToll,

    // Conduits
    UntemperedDedication: UntemperedDedication,

    // Tier Sets
    Tier28FourSet: Tier28FourSet,
  };
}

export default CombatLogParser;
