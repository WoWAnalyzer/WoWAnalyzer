import CoreCombatLogParser from 'parser/core/CombatLogParser';
import LowHealthHealing from 'parser/core/modules/features/LowHealthHealing';
import HealingDone from 'parser/core/modules/HealingDone';

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

import PaladinAbilityTracker from './modules/core/PaladinAbilityTracker';
import CastBehavior from './modules/core/CastBehavior';
import Overhealing from './modules/core/Overhealing';
import FillerLightOfTheMartyrs from './modules/core/FillerLightOfTheMartyrs';
import FillerFlashOfLight from './modules/core/FillerFlashOfLight';
import LightOfDawn from './modules/core/LightOfDawn';
import LightOfDawnIndexer from './modules/core/LightOfDawnIndexer';
import SpellManaCost from './modules/core/SpellManaCost';

import Abilities from './modules/Abilities';
import Checklist from './modules/features/Checklist/Module';
import MasteryEffectiveness from './modules/features/MasteryEffectiveness';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import StatValues from './modules/features/StatValues';

import MightOfTheMountain from './modules/racials/dwarf/MightOfTheMountain';

import RuleOfLaw from './modules/talents/RuleOfLaw';
import DevotionAuraDamageReduction from './modules/talents/DevotionAuraDamageReduction';
// import DevotionAuraLivesSaved from './Modules/Talents/DevotionAuraLivesSaved';
import AuraOfSacrificeDamageReduction from './modules/talents/AuraOfSacrificeDamageReduction';
// import AuraOfSacrificeLivesSaved from './Modules/Talents/AuraOfSacrificeLivesSaved';
import AuraOfMercy from './modules/talents/AuraOfMercy';
import HolyAvenger from './modules/talents/HolyAvenger';
import DivinePurpose from './modules/talents/DivinePurpose';
import CrusadersMight from './modules/talents/CrusadersMight';

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
    healingDone: [HealingDone, { showStatistic: true }],
    beaconTransferFactor: BeaconTransferFactor,
    beaconHealSource: BeaconHealSource,
    beaconHealingDone: BeaconHealingDone,
    beaconTargets: BeaconTargets,
    missingBeacons: MissingBeacons,
    failedBeaconTransfers: FailedBeaconTransfers,
    directBeaconHealing: DirectBeaconHealing,
    castBehavior: CastBehavior,
    overhealing: Overhealing,
    fillerLightOfTheMartyrs: FillerLightOfTheMartyrs,
    fillerFlashOfLight: FillerFlashOfLight,
    lightOfDawn: LightOfDawn,
    lightOfDawnIndexer: LightOfDawnIndexer,
    spellManaCost: SpellManaCost,

    // Features
    checklist: Checklist,
    abilities: Abilities,
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    statValues: StatValues,

    // Racials
    mightOfTheMountain: MightOfTheMountain,

    // Talents
    ruleOfLaw: RuleOfLaw,
    devotionAuradamageReduction: DevotionAuraDamageReduction,
    // devotionAuraLivesSaved: DevotionAuraLivesSaved,
    auraOfSacrificeDamageReduction: AuraOfSacrificeDamageReduction,
    // auraOfSacrificeLivesSaved: AuraOfSacrificeLivesSaved,
    auraOfMercy: AuraOfMercy,
    holyAvenger: HolyAvenger,
    divinePurpose: DivinePurpose,
    crusadersMight: CrusadersMight,
  };
}

export default CombatLogParser;
