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
} from 'analysis/retail/paladin/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import { Abilities } from './gen';
import AplCheck from './modules/core/AplCheck';
import GrandCrusader from './modules/talents/GrandCrusader';
import Haste from './modules/core/Haste';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import MitigationCheck from './modules/features/MitigationCheck';
import NoDamageShieldOfTheRighteous from './modules/features/NoDamageShieldOfTheRighteous';
import OvercapShieldOfTheRighteous from './modules/features/OvercapShieldOfTheRighteous';
import ShieldOfTheRighteous from './modules/features/ShieldOfTheRighteous';
import SpellUsable from './modules/features/SpellUsable';
import WordOfGloryTiming from './modules/features/WordOfGloryTiming';
import Consecration from './modules/spells/Consecration';
import HammerOfTheRighteous from './modules/spells/HammerOfTheRighteous';
import WordOfGlory from './modules/spells/WordOfGlory';
import BlessedHammerDamageReduction from './modules/talents/BlessedHammerDamageReduction';
import SoaringShield from './modules/talents/SoaringShield';
import Redoubt from './modules/talents/Redoubt';
import RighteousProtector from './modules/talents/RighteousProtector';
import GiftOfTheGoldenValkyr from './modules/talents/GiftOfTheGoldenValkyr';
import SanctifiedWrathProtJudgement from './modules/talents/SanctifiedWrathProtJudgement';
import CastLinkNormalizer from './modules/CastLinkNormalizer';
import GuardianOfAncientQueens from './normalizers/GuardianOfAncientQueens';
import DefensiveBuffLinkNormalizer from './modules/core/Defensives/DefensiveBuffLinkNormalizer';
import BuilderUse from './modules/core/BuilderUse';
import GuardianOfAncientKings from './modules/core/Defensives/GuardianOfAncientKings';
import ArdentDefender from './modules/core/Defensives/ArdentDefender';
import ConsecrationDefensives from './modules/core/Defensives/ConsecrationDefensives';
import Guide from './Guide';
import DefensiveBuffs from './modules/core/Defensives/Defensivebuffs';
import Valiance from './modules/talents/Valiance';

class CombatLogParser extends CoreCombatLogParser {
  static guide = Guide;
  static specModules = {
    // Core
    builderUse: BuilderUse,
    grandCrusader: GrandCrusader,
    haste: Haste,

    //Normalizers
    guardianOfAncientQueens: GuardianOfAncientQueens,
    castLinkNormalizer: CastLinkNormalizer,
    defensiveBuffLinkNormalizer: DefensiveBuffLinkNormalizer,

    // Spells
    hotr: HammerOfTheRighteous,
    wordOfGlory: WordOfGlory,
    judgment: Judgment,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    spellUsable: SpellUsable,
    wogTiming: WordOfGloryTiming,
    shieldOfTheRighteous: ShieldOfTheRighteous,
    consecration: Consecration,
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
    soaringShield: SoaringShield,
    divineToll: DivineToll,
    blessingOfDusk: BlessingOfDusk,
    blessingOfDawn: BlessingOfDawn,
    valiance: Valiance,
    lightBearer: Lightbearer,
    punishment: Punishment,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,

    // HolyPower
    holyPowerTracker: HolyPowerTracker,
    holyPowerDetails: HolyPowerDetails,
    holyPowerPerMinute: HolyPowerPerMinute,
    apl: AplCheck,
  };
}

export default CombatLogParser;
