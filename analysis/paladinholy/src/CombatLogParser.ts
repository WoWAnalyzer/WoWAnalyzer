import {
  HammerOfWrath,
  HolyAvenger,
  DivinePurpose,
  HolyPowerTracker,
  HolyPowerDetails,
  AshenHallow,
  DivineToll,
} from '@wowanalyzer/paladin';

import CoreCombatLogParser from 'parser/core/CombatLogParser';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';

import LightOfDawnNormalizer from './normalizers/LightOfDawn';
import BeaconOfVirtueNormalizer from './normalizers/BeaconOfVirtue';

import BeaconTransferFactor from './modules/beacons/BeaconTransferFactor';
import BeaconHealSource from './modules/beacons/BeaconHealSource';
import BeaconHealingDone from './modules/beacons/BeaconHealingDone';
import BeaconTargets from './modules/beacons/BeaconTargets';
import MissingBeacons from './modules/beacons/MissingBeacons';
import FailedBeaconTransfers from './modules/beacons/FailedBeaconTransfers';
import DirectBeaconHealing from './modules/beacons/DirectBeaconHealing';
import BeaconUptime from './modules/beacons/BeaconUptime';

import PaladinAbilityTracker from './modules/core/PaladinAbilityTracker';
import CastBehavior from './modules/features/CastBehavior';
import Overhealing from './modules/features/Overhealing';
import FillerLightOfTheMartyrs from './modules/spells/FillerLightOfTheMartyrs';
import InefficientLightOfTheMartyrs from './modules/spells/InefficientLightOfTheMartyrs';
import FillerFlashOfLight from './modules/spells/FillerFlashOfLight';
import LightOfDawn from './modules/spells/LightOfDawn';
import LightOfDawnIndexer from './modules/spells/LightOfDawnIndexer';

import Abilities from './modules/features/Abilities';
import Buffs from './modules/features/Buffs';
import Checklist from './modules/checklist/Module';
import MasteryEffectiveness from './modules/features/MasteryEffectiveness';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import StatValues from './modules/features/StatValues';

import MightOfTheMountain from './modules/racials/MightOfTheMountain';

import RuleOfLaw from './modules/talents/RuleOfLaw';
import DevotionAuraDamageReduction from './modules/spells/DevotionAuraDamageReduction';

import ShockBarrier from './modules/shadowlands/legendaries/ShockBarrier';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './constants';
import CrusadersMight from './modules/talents/CrusadersMight';
import AvengingCrusader from './modules/talents/AvengingCrusader';
import JudgmentOfLight from './modules/talents/JudgmentOfLight';
import GlimmerOfLight from './modules/talents/GlimmerOfLight';

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
    lightOfDawnIndexer: LightOfDawnIndexer,
    hammerOfWrath: HammerOfWrath,

    // Features
    checklist: Checklist,
    abilities: Abilities,
    buffs: Buffs,
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    statValues: StatValues,

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

    //-- shadowlands section --//
    // Lego
    shockBarrier: ShockBarrier,

    // Covenant
    ashenHallow: AshenHallow,
    divineToll: DivineToll,
  };
}

export default CombatLogParser;
