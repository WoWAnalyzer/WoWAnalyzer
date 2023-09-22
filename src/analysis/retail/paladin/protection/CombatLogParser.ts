import {
  Judgment,
  HolyPowerTracker,
  HolyPowerDetails,
  DivineToll,
  HolyPowerPerMinute,
} from 'analysis/retail/paladin/shared';
import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Abilities from './modules/Abilities';
import AplCheck from './modules/core/AplCheck';
import GrandCrusader from './modules/talents/GrandCrusader';
import Haste from './modules/core/Haste';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/Checklist/Module';
import MitigationCheck from './modules/features/MitigationCheck';
import NoDamageShieldOfTheRighteous from './modules/features/NoDamageShieldOfTheRighteous';
import OvercapShieldOfTheRighteous from './modules/features/OvercapShieldOfTheRighteous';
import ShieldOfTheRighteous from './modules/features/ShieldOfTheRighteous';
import SpellUsable from './modules/features/SpellUsable';
import WordOfGloryTiming from './modules/features/WordOfGloryTiming';
import Consecration from './modules/spells/Consecration';
import HammerOfTheRighteous from './modules/spells/HammerOfTheRighteous';
import LightOfTheProtector from './modules/spells/LightOfTheProtector';
import WordOfGlory from './modules/spells/WordOfGlory';
import BlessedHammerDamageReduction from './modules/talents/BlessedHammerDamageReduction';
import FirstAvenger from './modules/talents/FirstAvenger';
import HolyShieldSpellBlock from './modules/talents/HolyShieldSpellBlock';
import MomentOfGlory from './modules/talents/MomentOfGlory';
import Redoubt from './modules/talents/Redoubt';
import RighteousProtector from './modules/talents/RighteousProtector';
import SanctifiedWrathProtJudgement from './modules/talents/SanctifiedWrathProtJudgement';
import ProtPaladinT304P from './modules/core/ProtPaladinT304P';
import MyAbilityNormalizer from './modules/CastLinkNormalizer';
import GuardianOfAncientQueens from './normalizers/GuardianOfAncientQueens';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    grandCrusader: GrandCrusader,
    haste: Haste,
    protPaladinT304P: ProtPaladinT304P,
    myAbilityNormalizer: MyAbilityNormalizer,

    // Spells
    lightOfTheProtector: LightOfTheProtector,
    hotr: HammerOfTheRighteous,
    wordOfGlory: WordOfGlory,
    judgment: Judgment,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    spellUsable: SpellUsable,
    checklist: Checklist,
    wogTiming: WordOfGloryTiming,
    shieldOfTheRighteous: ShieldOfTheRighteous,
    consecration: Consecration,
    mitigationcheck: MitigationCheck,
    noDamageSOTR: NoDamageShieldOfTheRighteous,
    overcapSOTR: OvercapShieldOfTheRighteous,

    // Normalizers
    guardianOfAncientQueens: GuardianOfAncientQueens,

    // Talents
    righteousProtector: RighteousProtector,
    sanctifiedWrathProtJudgement: SanctifiedWrathProtJudgement,
    holyShieldSpellBlock: HolyShieldSpellBlock,
    redoubt: Redoubt,
    blessedHammerDamageReduction: BlessedHammerDamageReduction,
    firstAvenger: FirstAvenger,
    momentOfGlory: MomentOfGlory,
    divineToll: DivineToll,

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
