import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';

import {
  BoonOfTheAscended,
  FaeGuardians,
  Mindgames,
  TwinsOfTheSunPriestess,
  UnholyNova,
  TranslucentImage,
} from '@wowanalyzer/priest';
import AbilityTracker from '@wowanalyzer/priest-holy/src/modules/core/AbilityTracker';

import Abilities from './modules/Abilities';
import Checklist from './modules/checklist/Module';
import EchoOfLightMastery from './modules/core/EchoOfLightMastery';
import FortitudeRaidBuff from './modules/core/FortitudeRaidBuff';
import HolyWordsReductionBySpell from './modules/core/HolyWordsReductionBySpell';
import HolyWordWastedAmounts from './modules/core/HolyWordWastedAmounts';
import SpellManaCost from './modules/core/SpellManaCost';
// Spell data
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import HealingReceived from './modules/features/HealingReceived';
import HealingTargetTracker from './modules/features/HealingTargetTracker';
import HealingEfficiencyDetails from './modules/features/HolyPriestHealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/HolyPriestHealingEfficiencyTracker';
import SpellUsable from './modules/features/SpellUsable';
import StatWeights from './modules/features/StatWeights';
import ResonantWords from './modules/shadowlands/conduits/ResonantWords';
import DivineImage from './modules/shadowlands/items/DivineImage';
import FlashConcentration from './modules/shadowlands/items/FlashConcentration';
import HarmoniousApparatus from './modules/shadowlands/items/HarmoniousApparatus';
import CircleOfHealing from './modules/spells/CircleOfHealing';
import DivineHymn from './modules/spells/DivineHymn';
import GuardianSpirit from './modules/spells/GuardianSpirit';
import HolyNova from './modules/spells/HolyNova';
import HolyWordChastise from './modules/spells/holyword/HolyWordChastise';
import HolyWordSalvationCooldown from './modules/spells/holyword/HolyWordSalvation';
import HolyWordSanctify from './modules/spells/holyword/HolyWordSanctify';
import HolyWordSerenity from './modules/spells/holyword/HolyWordSerenity';
import HymnBuffBenefit from './modules/spells/HymnBuffBenefit';
import PrayerOfMending from './modules/spells/PrayerOfMending';
import Renew from './modules/spells/Renew';
import SpiritOfRedemption from './modules/spells/SpiritOfRedemption';
import Talents from './modules/talents';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    spellManaCost: SpellManaCost,
    abilities: Abilities,
    lowHealthHealing: LowHealthHealing,
    abilityTracker: AbilityTracker,

    // Generic healer things
    manaLevelChart: ManaLevelChart,
    manaUsageChart: ManaUsageChart,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    checklist: Checklist,
    cooldownThroughputTracker: CooldownThroughputTracker,
    spellUsable: SpellUsable,
    healingReceived: HealingReceived,
    healingTargetTracker: HealingTargetTracker,

    // Core
    echoOfLightMastery: EchoOfLightMastery,
    fortitudeRaidBuff: FortitudeRaidBuff,
    holyWordsReductionBySpell: HolyWordsReductionBySpell,
    holyWordWastedAmounts: HolyWordWastedAmounts,

    // Spells
    divineHymn: DivineHymn,
    guardianSpirit: GuardianSpirit,
    holyNova: HolyNova,
    hymnBuffBenefit: HymnBuffBenefit,
    holyWordSanctify: HolyWordSanctify,
    holyWordSerenity: HolyWordSerenity,
    holyWordChastise: HolyWordChastise,
    holyWordSalvation: HolyWordSalvationCooldown,
    statWeights: StatWeights,
    circleOfHealing: CircleOfHealing,

    spiritOfRedemption: SpiritOfRedemption,
    renew: Renew,
    prayerOfMending: PrayerOfMending,

    // Talents
    Enlightenment: Talents.t15.Enlightenment,
    TrailOfLight: Talents.t15.TrailOfLight,
    RenewedFaith: Talents.t15.RenewedFaith,

    AngelicFeather: Talents.t30.AngelicFeather,
    AngelsMercy: Talents.t30.AngelsMercy,
    BodyAndSoul: Talents.t30.BodyAndSoul,

    GuardianAngel: Talents.t45.GuardianAngel,
    Afterlife: Talents.t45.Afterlife,
    CosmicRipple: Talents.t45.CosmicRipple,

    Censure: Talents.t60.Censure,
    ShiningForce: Talents.t60.ShiningForce,
    PsychicVoice: Talents.t60.PsychicVoice,

    SurgeOfLight: Talents.t75.SurgeOfLight,
    PrayerCircle: Talents.t75.PrayerCircle,
    BindingHeals: Talents.t75.BindingHeals,

    Halo: Talents.t90.Halo,
    Benediction: Talents.t90.Benediction,
    DivineStar: Talents.t90.DivineStar,

    LightOfTheNaru: Talents.t100.LightOfTheNaaru,
    HolyWordSalvation: Talents.t100.HolyWordSalvation,
    Apotheosis: Talents.t100.Apotheosis,

    // Mana Tab
    manaTracker: ManaTracker,
    hpmDetails: HealingEfficiencyDetails,
    hpmTracker: HealingEfficiencyTracker,

    // Items
    harmoniousApparatus: HarmoniousApparatus,
    divineImage: DivineImage,
    twinsOfTheSunPriestess: TwinsOfTheSunPriestess,
    flashConcentration: FlashConcentration,

    // Conduits
    resonantWords: ResonantWords,
    TranslucentImage: TranslucentImage,

    // Covenants
    unholyNova: UnholyNova,
    mindgames: Mindgames,
    boonOfTheAscended: BoonOfTheAscended,
    faeGuardians: FaeGuardians,
  };
}

export default CombatLogParser;
