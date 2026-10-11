import {
  Judgment,
  HolyPowerTracker,
  HolyPowerDetails,
  HolyPowerPerMinute,
  DuskAndDawn,
} from 'analysis/retail/paladin/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Abilities from './modules/Abilities';
import AplCheck from './modules/core/AplCheck';
import GrandCrusader from './modules/talents/GrandCrusader';
import Haste from './modules/core/Haste';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import MitigationCheck from './modules/features/MitigationCheck';
import NoDamageShieldOfTheRighteous from './modules/features/NoDamageShieldOfTheRighteous';
import ShieldOfTheRighteous from './modules/features/ShieldOfTheRighteous';
import SpellUsable from './modules/features/SpellUsable';
import WordOfGloryTiming from './modules/features/WordOfGloryTiming';
import Consecration from './modules/spells/Consecration';
import HammerOfTheRighteous from './modules/spells/HammerOfTheRighteous';
import WordOfGlory from './modules/spells/WordOfGlory';
import HammerOfWrath from './modules/spells/HammerOfWrath';
import JudgmentCooldown from './modules/spells/JudgmentCooldown';
import BlessedHammerDamageReduction from './modules/talents/BlessedHammerDamageReduction';
import FirstAvenger from './modules/talents/FirstAvenger';
import Redoubt from './modules/talents/Redoubt';
import RighteousProtector from './modules/talents/RighteousProtector';
import GiftOfTheGoldenValkyr from './modules/talents/GiftOfTheGoldenValkyr';
import GloryOfTheVanguard from './modules/talents/GloryOfTheVanguard';
import GuardianOfAncientQueens from './normalizers/GuardianOfAncientQueens';
import GrandCrusaderAfterTrigger from './normalizers/GrandCrusaderAfterTrigger';
import DefensiveBuffLinkNormalizer from './modules/core/Defensives/DefensiveBuffLinkNormalizer';
import BuilderUse from './modules/core/BuilderUse';
import GuardianOfAncientKings from './modules/core/Defensives/GuardianOfAncientKings';
import ArdentDefender from './modules/core/Defensives/ArdentDefender';
import Sentinel from './modules/core/Defensives/Sentinel';
import ConsecrationDefensives from './modules/core/Defensives/ConsecrationDefensives';
import Guide from './Guide';
import DefensiveBuffs from './modules/core/Defensives/Defensivebuffs';
import Valiance from './modules/talents/Valiance';
import Lightbearer from '../shared/Lightbearer';

class CombatLogParser extends CoreCombatLogParser {
  static guide = Guide;
  static specModules = {
    // Core
    builderUse: BuilderUse,
    grandCrusader: GrandCrusader,
    haste: Haste,

    //Normalizers
    guardianOfAncientQueens: GuardianOfAncientQueens,
    grandCrusaderAfterTrigger: GrandCrusaderAfterTrigger,
    defensiveBuffLinkNormalizer: DefensiveBuffLinkNormalizer,

    // Spells
    hotr: HammerOfTheRighteous,
    wordOfGlory: WordOfGlory,
    hammerOfWrath: HammerOfWrath,
    judgmentCooldown: JudgmentCooldown,
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

    // Defensive Usage
    defensiveBuffs: DefensiveBuffs,
    guardianOfAncientKings: GuardianOfAncientKings,
    ardentDefender: ArdentDefender,
    sentinel: Sentinel,
    consecrationDefensives: ConsecrationDefensives,

    // Talents
    righteousProtector: RighteousProtector,
    giftOfTheGoldenValkyr: GiftOfTheGoldenValkyr,
    gloryOfTheVanguard: GloryOfTheVanguard,
    redoubt: Redoubt,
    blessedHammerDamageReduction: BlessedHammerDamageReduction,
    firstAvenger: FirstAvenger,
    duskAndDawn: DuskAndDawn,
    valiance: Valiance,
    lightBearer: Lightbearer,

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
