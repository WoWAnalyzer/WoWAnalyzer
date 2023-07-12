import AbilityTracker from 'analysis/retail/priest/holy/modules/core/AbilityTracker';
import { Mindgames, TranslucentImage } from 'analysis/retail/priest/shared';
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
import T29TwoSet from './modules/dragonflight/tier/tier29/Tier29HolyPriest2Set';
import T29FourSet from './modules/dragonflight/tier/tier29/Tier29HolyPriest4Set';
import T30FourSet from './modules/dragonflight/tier/tier30/Tier30HolyPriest4Set';
import ProtectiveLight from '../shared/ProtectiveLight';
import PrayerOfHealing from './modules/spells/PrayerOfHealing';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';
import Guide from './Guide';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    spellManaCost: SpellManaCost,
    abilities: Abilities,
    lowHealthHealing: LowHealthHealing,
    abilityTracker: AbilityTracker,

    // Normalizers
    castLinkNormalizer: CastLinkNormalizer,

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
    prayerOfHealing: PrayerOfHealing,

    spiritOfRedemption: SpiritOfRedemption,
    renew: Renew,
    prayerOfMending: PrayerOfMending,

    T29TwoSet: T29TwoSet,
    T29FourSet: T29FourSet,
    T30FourSet: T30FourSet,
    // Talents
    Enlightenment: Talents.MiddleRow.Enlightenment,
    TrailOfLight: Talents.MiddleRow.TrailOfLight,
    RenewedFaith: Talents.TopRow.RenewedFaith,
    DesperateTimes: Talents.BottomRow.DesperateTimes,
    HealingChorus: Talents.MiddleRow.HealingChorus,
    EverlastingLight: Talents.MiddleRow.EverlastingLight,

    BindingHeals: Talents.Classwide.BindingHeals,
    AngelsMercy: Talents.Classwide.AngelsMercy,

    GuardianAngel: Talents.TopRow.GuardianAngel,
    Afterlife: Talents.TopRow.Afterlife,
    CosmicRipple: Talents.TopRow.CosmicRipple,

    Censure: Talents.TopRow.Censure,
    PsychicVoice: Talents.Classwide.PsychicVoice,

    ProtectiveLight: ProtectiveLight,
    SurgeOfLight: Talents.Classwide.SurgeOfLight,
    PrayerCircle: Talents.MiddleRow.PrayerCircle,
    SanctifiedPrayers: Talents.TopRow.SanctifiedPrayers,
    PrayerfulLitany: Talents.MiddleRow.PrayerfulLitany,

    Halo: Talents.Classwide.Halo,
    Benediction: Talents.MiddleRow.Benediction,
    RevitalizingPrayers: Talents.MiddleRow.RevitalizingPrayers,
    DivineStar: Talents.Classwide.DivineStar,
    Mindgames: Mindgames,
    DivineWord: Talents.BottomRow.DivineWord,

    HolyWordSalvation: Talents.BottomRow.HolyWordSalvation,
    Apotheosis: Talents.BottomRow.Apotheosis,
    AnsweredPrayers: Talents.BottomRow.AnsweredPrayers,
    Pontifex: Talents.BottomRow.Pontifex,
    Lightweaver: Talents.BottomRow.Lightweaver,

    divineImage: Talents.BottomRow.DivineImage,
    lightOfTheNaaru: Talents.BottomRow.LightOfTheNaaru,
    harmoniousApparatus: Talents.BottomRow.HarmoniousApparatus,
    resonantWords: Talents.BottomRow.ResonantWords,
    TranslucentImage: TranslucentImage,
    rapidRecovery: Talents.BottomRow.RapidRecovery,
    empoweredRenew: Talents.BottomRow.EmpoweredRenew,
    miracleWorker: Talents.BottomRow.MiracleWorker,

    BurningVehemence: Talents.TopRow.BurningVehemence,

    // Mana Tab
    manaTracker: ManaTracker,
    hpmDetails: HealingEfficiencyDetails,
    hpmTracker: HealingEfficiencyTracker,
  };

  static guide = Guide;
}

export default CombatLogParser;
