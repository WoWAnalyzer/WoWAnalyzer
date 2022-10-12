import AbilityTracker from 'analysis/retail/priest/holy/modules/core/AbilityTracker';
import { Mindgames, TwinsOfTheSunPriestess, TranslucentImage } from 'analysis/retail/priest/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
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
    Enlightenment: Talents.MiddleRow.Enlightenment,
    TrailOfLight: Talents.MiddleRow.TrailOfLight,
    RenewedFaith: Talents.TopRow.RenewedFaith,
    DesperateTimes: Talents.BottomRow.DesperateTimes,

    BindingHeals: Talents.Classwide.BindingHeals,
    AngelicFeather: Talents.Classwide.AngelicFeather,
    AngelsMercy: Talents.Classwide.AngelsMercy,
    BodyAndSoul: Talents.Classwide.BodyAndSoul,

    GuardianAngel: Talents.TopRow.GuardianAngel,
    Afterlife: Talents.TopRow.Afterlife,
    CosmicRipple: Talents.TopRow.CosmicRipple,

    Censure: Talents.TopRow.Censure,
    PsychicVoice: Talents.Classwide.PsychicVoice,

    SurgeOfLight: Talents.Classwide.SurgeOfLight,
    PrayerCircle: Talents.MiddleRow.PrayerCircle,

    Halo: Talents.Classwide.Halo,
    Benediction: Talents.MiddleRow.Benediction,
    DivineStar: Talents.Classwide.DivineStar,
    mindgames: Mindgames,

    HolyWordSalvation: Talents.BottomRow.HolyWordSalvation,
    Apotheosis: Talents.BottomRow.Apotheosis,
    AnsweredPrayers: Talents.BottomRow.AnsweredPrayers,
    Lightweaver: Talents.BottomRow.Lightweaver,

    divineImage: Talents.BottomRow.DivineImage,
    twinsOfTheSunPriestess: TwinsOfTheSunPriestess,
    resonantWords: Talents.BottomRow.ResonantWords,
    TranslucentImage: TranslucentImage,
    // Mana Tab
    manaTracker: ManaTracker,
    hpmDetails: HealingEfficiencyDetails,
    hpmTracker: HealingEfficiencyTracker,
  };
}

export default CombatLogParser;
