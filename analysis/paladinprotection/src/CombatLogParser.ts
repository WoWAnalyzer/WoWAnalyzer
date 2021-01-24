import { Judgment, HolyPowerTracker, HolyPowerDetails, DivineToll } from '@wowanalyzer/paladin';

import CoreCombatLogParser from 'parser/core/CombatLogParser';
import ArcaneTorrent from 'parser/shared/modules/racials/bloodelf/ArcaneTorrent';

import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import SpellUsable from './modules/features/SpellUsable';
import Checklist from './modules/features/Checklist/Module';
import MitigationCheck from './modules/features/MitigationCheck';
import Haste from './modules/core/Haste';

import OvercapShieldOfTheRighteous from './modules/features/OvercapShieldOfTheRighteous';

//Spells
import Consecration from './modules/spells/Consecration';
import WordOfGloryTiming from './modules/features/WordOfGloryTiming';
import LightOfTheProtector from './modules/spells/LightOfTheProtector';
import ShieldOfTheRighteous from './modules/features/ShieldOfTheRighteous';
import GrandCrusader from './modules/core/GrandCrusader';
import HammerOfTheRighteous from './modules/spells/HammerOfTheRighteous';
import NoDamageShieldOfTheRighteous from './modules/features/NoDamageShieldOfTheRighteous';
import WordOfGlory from './modules/spells/WordOfGlory';

//Talents
import RighteousProtector from './modules/talents/RighteousProtector';
import Seraphim from './modules/talents/Seraphim';
import SanctifiedWrathProtJudgement from './modules/talents/SanctifiedWrathProtJudgement';
import HolyShieldSpellBlock from './modules/talents/HolyShieldSpellBlock';
import Redoubt from './modules/talents/Redoubt';
import BlessedHammerDamageReduction from './modules/talents/BlessedHammerDamageReduction';
import FirstAvenger from './modules/talents/FirstAvenger';
import MomentOfGlory from './modules/talents/MomentOfGlory';

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

    // Covenant Abilities
    devineToll: DivineToll,
  };
}

export default CombatLogParser;
