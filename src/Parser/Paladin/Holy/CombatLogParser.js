import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import LowHealthHealing from 'Parser/Core/Modules/Features/LowHealthHealing';
import HealingDone from 'Parser/Core/Modules/HealingDone';

import LightOfDawnNormalizer from './Normalizers/LightOfDawn';
import DivinePurposeNormalizer from './Normalizers/DivinePurpose';
import BeaconOfVirtueNormalizer from './Normalizers/BeaconOfVirtue';

import PaladinAbilityTracker from './Modules/PaladinCore/PaladinAbilityTracker';
import BeaconHealOriginMatcher from './Modules/PaladinCore/BeaconHealOriginMatcher';
import BeaconTargets from './Modules/PaladinCore/BeaconTargets';
import BeaconHealing from './Modules/PaladinCore/BeaconHealing';
import CastBehavior from './Modules/PaladinCore/CastBehavior';
import Overhealing from './Modules/PaladinCore/Overhealing';
import FillerLightOfTheMartyrs from './Modules/PaladinCore/FillerLightOfTheMartyrs';
import FillerFlashOfLight from './Modules/PaladinCore/FillerFlashOfLight';
import LightOfDawn from './Modules/PaladinCore/LightOfDawn';
import LightOfDawnIndexer from './Modules/PaladinCore/LightOfDawnIndexer';
import SpellManaCost from './Modules/PaladinCore/SpellManaCost';

import Abilities from './Modules/Abilities';
import Checklist from './Modules/Features/Checklist/Module';
import MasteryEffectiveness from './Modules/Features/MasteryEffectiveness';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import StatValues from './Modules/Features/StatValues';

import RuleOfLaw from './Modules/Talents/RuleOfLaw';
import DevotionAuraDamageReduction from './Modules/Talents/DevotionAuraDamageReduction';
// import DevotionAuraLivesSaved from './Modules/Talents/DevotionAuraLivesSaved';
import AuraOfSacrificeDamageReduction from './Modules/Talents/AuraOfSacrificeDamageReduction';
// import AuraOfSacrificeLivesSaved from './Modules/Talents/AuraOfSacrificeLivesSaved';
import AuraOfMercy from './Modules/Talents/AuraOfMercy';
import HolyAvenger from './Modules/Talents/HolyAvenger';
import DivinePurpose from './Modules/Talents/DivinePurpose';
import CrusadersMight from './Modules/Talents/CrusadersMight';

import DrapeOfShame from './Modules/Items/DrapeOfShame';
import Ilterendi from './Modules/Items/Ilterendi';
import ChainOfThrayn from './Modules/Items/ChainOfThrayn';
import ObsidianStoneSpaulders from './Modules/Items/ObsidianStoneSpaulders';
import MaraadsDyingBreath from './Modules/Items/MaraadsDyingBreath';
import SoulOfTheHighlord from './Modules/Items/SoulOfTheHighlord';
import Tier19_4set from './Modules/Items/Tier19_4set';
import Tier20_4set from './Modules/Items/Tier20_4set';
import Tier21_2set from './Modules/Items/Tier21_2set';
import Tier21_4set from './Modules/Items/Tier21_4set';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from './Constants';

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
    beaconHealOriginMatcher: BeaconHealOriginMatcher,
    beaconTargets: BeaconTargets,
    beaconHealing: BeaconHealing,
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

    // Items:
    drapeOfShame: DrapeOfShame,
    ilterendi: Ilterendi,
    chainOfThrayn: ChainOfThrayn,
    obsidianStoneSpaulders: ObsidianStoneSpaulders,
    maraadsDyingBreath: MaraadsDyingBreath,
    soulOfTheHighlord: SoulOfTheHighlord,
    tier19_4set: Tier19_4set,
    tier20_4set: Tier20_4set,
    tier21_2set: Tier21_2set,
    tier21_4set: Tier21_4set,
  };
}

export default CombatLogParser;
