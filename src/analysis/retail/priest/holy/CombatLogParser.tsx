import AbilityTracker from 'analysis/retail/priest/holy/modules/core/AbilityTracker';
import { TranslucentImage } from 'analysis/retail/priest/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';
import LowHealthHealing from 'parser/shared/modules/features/LowHealthHealing';
import ManaLevelChart from 'parser/shared/modules/resources/mana/ManaLevelChart';
import ManaUsageChart from 'parser/shared/modules/resources/mana/ManaUsageChart';
import Abilities from './modules/Abilities';
import Checklist from './modules/checklist/Module';
import EchoOfLightMastery from './modules/core/EchoOfLightMastery';
import FortitudeRaidBuff from './modules/core/FortitudeRaidBuff';
import SpellManaCost from './modules/core/SpellManaCost';
// Spell data
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import HealingReceived from './modules/features/HealingReceived';
import HealingTargetTracker from './modules/features/HealingTargetTracker';
import HealingEfficiencyDetails from './modules/features/HolyPriestHealingEfficiencyDetails';
import HealingEfficiencyTracker from './modules/features/HolyPriestHealingEfficiencyTracker';
import SpellUsable from './modules/features/SpellUsable';

import DivineHymn from './modules/spells/DivineHymn';
import GuardianSpirit from './modules/spells/GuardianSpirit';
import HolyNova from './modules/spells/HolyNova';
import HymnBuffBenefit from './modules/spells/HymnBuffBenefit';
import PrayerOfMending from './modules/spells/PrayerOfMending';
import Renew from './modules/spells/Renew';
import SpiritOfRedemption from './modules/spells/SpiritOfRedemption';
import Talents from './modules/talents';
import ProtectiveLight from '../shared/ProtectiveLight';
import PrayerOfHealing from './modules/spells/PrayerOfHealing';
import CastLinkNormalizer from './normalizers/CastLinkNormalizer';
import Guide from './Guide';
import Benevolence from '../shared/Benevolence';
import RenewTracker from './modules/talents/Oracle/OracleCore/RenewTracker';
import RenewAttributor from './modules/talents/Oracle/OracleCore/RenewAttributor';
import EOLAttrib from './modules/core/EchoOfLightAttributor';
import HolyWordCDRBySpell from './modules/core/HolyWordCDRBySpell';
import HolyWordCDR from './modules/core/HolyWordCDR';
import EchoOfLightDisplay from './modules/core/EchoOfLightDisplay';
import HolyTWW4pS1 from './modules/tww/HolyTWW4pcS1';
import HolyTWW4pS1Display from './modules/tww/HolyTWW4pcS1Display';

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
    renewTracker: RenewTracker,
    renewAttributor: RenewAttributor,
    eolAttrib: EOLAttrib,
    holyWordCDRBySpell: HolyWordCDRBySpell,
    holyWordCDR: HolyWordCDR,
    echoOfLightDisplay: EchoOfLightDisplay,

    // Spells
    divineHymn: DivineHymn,
    guardianSpirit: GuardianSpirit,
    holyNova: HolyNova,
    hymnBuffBenefit: HymnBuffBenefit,

    prayerOfHealing: PrayerOfHealing,
    benevolence: Benevolence,

    spiritOfRedemption: SpiritOfRedemption,
    renew: Renew,
    prayerOfMending: PrayerOfMending,

    // Items

    holyTWW4pcS1: HolyTWW4pS1,
    holyTWW4pS1Display: HolyTWW4pS1Display,

    // Talents
    Enlightenment: Talents.MiddleRow.Enlightenment,
    TrailOfLight: Talents.MiddleRow.TrailOfLight,
    RenewedFaith: Talents.TopRow.RenewedFaith,
    DesperateTimes: Talents.BottomRow.DesperateTimes,
    EverlastingLight: Talents.MiddleRow.EverlastingLight,
    PrismaticEchoes: Talents.MiddleRow.PrismaticEchoes,
    CrisisManagement: Talents.MiddleRow.CrisisManagement,

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
    PrayerfulLitany: Talents.MiddleRow.PrayerfulLitany,

    Halo: Talents.Classwide.Halo,
    Benediction: Talents.MiddleRow.Benediction,
    DivineStar: Talents.Classwide.DivineStar,
    DivineWord: Talents.BottomRow.DivineWord,
    Apotheosis: Talents.BottomRow.Apotheosis,
    AnsweredPrayers: Talents.BottomRow.AnsweredPrayers,
    Lightweaver: Talents.BottomRow.Lightweaver,

    divineImage: Talents.BottomRow.DivineImage,
    resonantWords: Talents.BottomRow.ResonantWords,
    TranslucentImage: TranslucentImage,
    miracleWorker: Talents.BottomRow.MiracleWorker,
    Lightwell: Talents.BottomRow.Lightwell,

    BurningVehemence: Talents.TopRow.BurningVehemence,

    // Archon Hero Talent Display
    PerfectedFormHoly: Talents.Archon.PerfectedFormHoly,
    ResonantEnergyHoly: Talents.Archon.ResonantEnergyHoly,
    ManifestedPowerHoly: Talents.Archon.ManifestedPowerHoly,
    EmpoweredSurgesHoly: Talents.Archon.EmpoweredSurgesHoly,
    EnergyCompressionHoly: Talents.Archon.EnergyCompressionHoly,
    PowerSurgeAndDivineHaloHoly: Talents.Archon.PowerSurgeAndDivineHaloHoly,

    // Oracle Hero Talents
    PremontitionOfSolace: Talents.Oracle.PremonitionOfSolace,
    PremonitionOfPiety: Talents.Oracle.PremonitionOfPiety,
    PremonitionOfInsight: Talents.Oracle.PremonitionOfInsight,

    // Holy Specific Oracle Hero Talents
    PreventiveMeasuresHoly: Talents.Oracle.PreventiveMeasuresHoly,
    PreemptiveCareHoly: Talents.Oracle.PreemptiveCareHoly,
    ProphetsWillHoly: Talents.Oracle.ProphetsWillHoly,
    AssuredSafetyHoly: Talents.Oracle.AssuredSafetyHoly,

    // Mana Tab
    manaTracker: ManaTracker,
    hpmDetails: HealingEfficiencyDetails,
    hpmTracker: HealingEfficiencyTracker,
  };

  static guide = Guide;
}

export default CombatLogParser;
