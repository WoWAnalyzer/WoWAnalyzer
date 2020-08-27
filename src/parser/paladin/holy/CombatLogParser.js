import CoreCombatLogParser from 'parser/core/CombatLogParser';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import LucidDreamsHealers from 'parser/shared/modules/spells/bfa/essences/LucidDreamsHealers';

import LightOfDawnNormalizer from './normalizers/LightOfDawn';
import DivinePurposeNormalizer from './normalizers/DivinePurpose';
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
import CastBehavior from './modules/CastBehavior';
import Overhealing from './modules/Overhealing';
import FillerLightOfTheMartyrs from './modules/FillerLightOfTheMartyrs';
import InefficientLightOfTheMartyrs from './modules/InefficientLightOfTheMartyrs';
import FillerFlashOfLight from './modules/FillerFlashOfLight';
import LightOfDawn from './modules/LightOfDawn';
import LightOfDawnIndexer from './modules/LightOfDawnIndexer';
import SpellManaCost from './modules/core/SpellManaCost';

import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import Checklist from './modules/checklist/Module';
import MasteryEffectiveness from './modules/MasteryEffectiveness';
import AlwaysBeCasting from './modules/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/CooldownThroughputTracker';
import StatValues from './modules/StatValues';

import MightOfTheMountain from './modules/MightOfTheMountain';

import RuleOfLaw from './modules/talents/RuleOfLaw';
import DevotionAuraDamageReduction from './modules/talents/DevotionAuraDamageReduction';
import AuraOfSacrificeDamageReduction from './modules/talents/AuraOfSacrificeDamageReduction';
import AuraOfMercy from './modules/talents/AuraOfMercy';
import HolyAvenger from './modules/talents/HolyAvenger';
import DivinePurpose from './modules/talents/DivinePurpose';
import CrusadersMight from './modules/talents/CrusadersMight';
import AvengingCrusader from './modules/talents/AvengingCrusader';
import JudgmentOfLight from './modules/talents/JudgmentOfLight';

// azerite traits //
import GraceOfTheJusticar from './modules/azeritetraits/GraceOfTheJusticar';
import GlimmerOfLight from './modules/azeritetraits/GlimmerOfLight';
import LightsDecree from './modules/azeritetraits/LightsDecree';
import RadiantIncandescence from './modules/azeritetraits/RadiantIncandescence';
import VisionOfPerfection from './modules/azeritetraits/VisionOfPerfection';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './constants';

class CombatLogParser extends CoreCombatLogParser {
  static abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;

  static specModules = {
    // Normalizers
    lightOfDawnNormalizer: LightOfDawnNormalizer,
    divinePurposeNormalizer: DivinePurposeNormalizer,
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
    spellManaCost: SpellManaCost,

    // Generic healer things
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,

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
    auraOfSacrificeDamageReduction: AuraOfSacrificeDamageReduction,
    auraOfMercy: AuraOfMercy,
    holyAvenger: HolyAvenger,
    divinePurpose: DivinePurpose,
    crusadersMight: CrusadersMight,
    avengingCrusader: AvengingCrusader,
    judgmentOfLight: JudgmentOfLight,

    // Azerite Traits //
    graceOfTheJusticar: GraceOfTheJusticar,
    radiantIncandescence: RadiantIncandescence,
    glimmerOfLight: GlimmerOfLight,
    lightsDecree: LightsDecree,
    visionOfPerfection: VisionOfPerfection,

    // Azerite Essences //
    lucidDream: LucidDreamsHealers,
  };
}

export default CombatLogParser;
