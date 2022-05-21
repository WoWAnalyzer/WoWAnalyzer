import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import {
  Judgment,
  HolyPowerTracker,
  HolyPowerDetails,
  DivineToll,
  AshenHallow,
  HolyPowerPerMinute,
  VanquishersHammer,
} from '@wowanalyzer/paladin';

import Abilities from './modules/Abilities';
import AplCheck from './modules/core/AplCheck';
import GlobalCooldown from './modules/core/GlobalCooldown';
import GrandCrusader from './modules/core/GrandCrusader';
import Haste from './modules/core/Haste';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Checklist from './modules/features/Checklist/Module';
import MitigationCheck from './modules/features/MitigationCheck';
import NoDamageShieldOfTheRighteous from './modules/features/NoDamageShieldOfTheRighteous';
import OvercapShieldOfTheRighteous from './modules/features/OvercapShieldOfTheRighteous';
import ShieldOfTheRighteous from './modules/features/ShieldOfTheRighteous';
import SpellUsable from './modules/features/SpellUsable';
import WordOfGloryTiming from './modules/features/WordOfGloryTiming';
import SepulcherTierSet from './modules/shadowlands/SepulcherTierSet';
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
import Seraphim from './modules/talents/Seraphim';

//import CooldownTracker from './Modules/Features/CooldownTracker';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core
    grandCrusader: GrandCrusader,
    haste: Haste,

    // Spells
    lightOfTheProtector: LightOfTheProtector,
    hotr: HammerOfTheRighteous,
    wordOfGlory: WordOfGlory,
    judgment: Judgment,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    globalCooldown: GlobalCooldown,
    spellUsable: SpellUsable,
    checklist: Checklist,
    wogTiming: WordOfGloryTiming,
    shieldOfTheRighteous: ShieldOfTheRighteous,
    consecration: Consecration,
    mitigationcheck: MitigationCheck,
    noDamageSOTR: NoDamageShieldOfTheRighteous,
    overcapSOTR: OvercapShieldOfTheRighteous,
    //cooldownTracker: CooldownTracker,

    // Talents
    righteousProtector: RighteousProtector,
    seraphim: Seraphim,
    sanctifiedWrathProtJudgement: SanctifiedWrathProtJudgement,
    holyShieldSpellBlock: HolyShieldSpellBlock,
    redoubt: Redoubt,
    blessedHammerDamageReduction: BlessedHammerDamageReduction,
    firstAvenger: FirstAvenger,
    momentOfGlory: MomentOfGlory,

    // There's no throughput benefit from casting Arcane Torrent on cooldown
    arcaneTorrent: [ArcaneTorrent, { castEfficiency: null }] as const,

    // HolyPower
    holyPowerTracker: HolyPowerTracker,
    holyPowerDetails: HolyPowerDetails,
    holyPowerPerMinute: HolyPowerPerMinute,

    // Covenant Abilities
    divineToll: DivineToll,
    ashenHallow: AshenHallow,
    vanquishersHammer: VanquishersHammer,

    // Tier Set
    sepulcherSet: SepulcherTierSet,

    apl: AplCheck,
  };
}

export default CombatLogParser;
