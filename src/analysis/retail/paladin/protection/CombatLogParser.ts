// =====================
// Shared Paladin modules
// =====================
import {
  Judgment,
  HolyPowerTracker,
  HolyPowerDetails,
  DivineToll,
  HolyPowerPerMinute,
  BlessingOfDusk,
  BlessingOfDawn,
  Lightbearer,
  Punishment,
  HammerOfWrath,
  DivineResonance,
  UnbreakableSpirit,
  DivinePurpose,
} from 'analysis/retail/paladin/shared';

// =====================
// Core
// =====================
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';
import { Abilities } from './gen';
import AplCheck from './modules/core/AplCheck';
import GrandCrusader from './modules/talents/GrandCrusader';
import Haste from './modules/core/Haste';
import BuilderUse from './modules/core/BuilderUse';
import WingsHolyPower from './modules/core/WingsHolyPower';
import Guide from './Guide';

// =====================
// Normalizers
// =====================
import GuardianOfAncientQueens from './normalizers/GuardianOfAncientQueens';
import CastLinkNormalizer from './modules/CastLinkNormalizer';
import DefensiveBuffLinkNormalizer from './modules/core/Defensives/DefensiveBuffLinkNormalizer';

// =====================
// Spells
// =====================
import HammerOfTheRighteous from './modules/spells/HammerOfTheRighteous';
import WordOfGlory from './modules/spells/WordOfGlory';
import Consecration from './modules/spells/Consecration';

// =====================
// Features
// =====================
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import SpellUsable from './modules/features/SpellUsable';
import WordOfGloryTiming from './modules/features/WordOfGloryTiming';
import ShieldOfTheRighteous from './modules/features/ShieldOfTheRighteous';
import MitigationCheck from './modules/features/MitigationCheck';
import NoDamageShieldOfTheRighteous from './modules/features/NoDamageShieldOfTheRighteous';
import OvercapShieldOfTheRighteous from './modules/features/OvercapShieldOfTheRighteous';

// =====================
// Defensive cooldowns & buffs
// =====================
import GuardianOfAncientKings from './modules/core/Defensives/GuardianOfAncientKings';
import ArdentDefender from './modules/core/Defensives/ArdentDefender';
import ConsecrationDefensives from './modules/core/Defensives/ConsecrationDefensives';
import DefensiveBuffs from './modules/core/Defensives/Defensivebuffs';

// =====================
// Talents
// =====================
import RighteousProtector from './modules/talents/RighteousProtector';
import GiftOfTheGoldenValkyr from './modules/talents/GiftOfTheGoldenValkyr';
import SanctifiedWrathProtJudgement from './modules/talents/SanctifiedWrathProtJudgement';
import Redoubt from './modules/talents/Redoubt';
import BlessedHammerDamageReduction from './modules/talents/BlessedHammerDamageReduction';
import SoaringShield from './modules/talents/SoaringShield';
import Valiance from './modules/talents/Valiance';
import HolyArmaments from './modules/talents/HolyArmaments';
import Vanguard from './modules/talents/Vanguard';
import SacredWeaponCoverage from './modules/talents/SacredWeaponCoverage';

class CombatLogParser extends CoreCombatLogParser {
  static guide = Guide;
  static specModules = {
    // Core
    builderUse: BuilderUse,
    grandCrusader: GrandCrusader,
    haste: Haste,
    wingsHolyPower: WingsHolyPower,

    // Normalizers
    guardianOfAncientQueens: GuardianOfAncientQueens,
    castLinkNormalizer: CastLinkNormalizer,
    defensiveBuffLinkNormalizer: DefensiveBuffLinkNormalizer,

    // Spells
    hotr: HammerOfTheRighteous,
    wordOfGlory: WordOfGlory,
    judgment: Judgment,
    consecration: Consecration,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    spellUsable: SpellUsable,
    wogTiming: WordOfGloryTiming,
    shieldOfTheRighteous: ShieldOfTheRighteous,
    mitigationcheck: MitigationCheck,
    noDamageSOTR: NoDamageShieldOfTheRighteous,
    overcapSOTR: OvercapShieldOfTheRighteous,

    // Defensive Usage
    defensiveBuffs: DefensiveBuffs,
    guardianOfAncientKings: GuardianOfAncientKings,
    ardentDefender: ArdentDefender,
    consecrationDefensives: ConsecrationDefensives,

    // Talents
    righteousProtector: RighteousProtector,
    giftOfTheGoldenValkyr: GiftOfTheGoldenValkyr,
    sanctifiedWrathProtJudgement: SanctifiedWrathProtJudgement,
    redoubt: Redoubt,
    blessedHammerDamageReduction: BlessedHammerDamageReduction,
    divineToll: DivineToll,
    blessingOfDusk: BlessingOfDusk,
    blessingOfDawn: BlessingOfDawn,
    valiance: Valiance,
    holyArmaments: HolyArmaments,
    soaringShield: SoaringShield,
    vanguard: Vanguard,
    sacredWeaponCoverage: SacredWeaponCoverage,
    divineResonance: DivineResonance,
    lightBearer: Lightbearer,
    punishment: Punishment,
    hammerOfWrath: HammerOfWrath,
    unbreakableSpirit: UnbreakableSpirit,
    divinePurpose: DivinePurpose,

    // Racials & Misc
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,

    // Holy Power
    holyPowerTracker: HolyPowerTracker,
    holyPowerDetails: HolyPowerDetails,
    holyPowerPerMinute: HolyPowerPerMinute,

    // APL
    apl: AplCheck,
  };
}

export default CombatLogParser;
