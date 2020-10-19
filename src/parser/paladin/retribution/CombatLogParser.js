import CoreCombatLogParser from 'parser/core/CombatLogParser';

import Haste from './modules/core/Haste';

import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/features/Checklist/Module';
import Judgment from './modules/core/Judgment';
import ShieldOfVengeance from './modules/core/ShieldOfVengeance';

import DivinePurpose from './modules/talents/DivinePurpose';
import ArtOfWar from './modules/core/ArtOfWar';
import BladeofJustice from './modules/core/BladeofJustice';
import CrusaderStrike from './modules/core/CrusaderStrike';
import Crusade from './modules/talents/Crusade';
import WakeofAshes from './modules/core/WakeofAshes';
import Consecration from './modules/talents/Consecration';
import HammerofWrathRetribution from './modules/core/HammerofWrath';
import RighteousVerdict from './modules/talents/RighteousVerdict';
import ExecutionSentence from './modules/talents/ExecutionSentence';

import HolyPowerTracker from '../shared/holypower/HolyPowerTracker';
import HolyPowerDetails from '../shared/holypower/HolyPowerDetails';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    haste: Haste,
    // PaladinCore
    artOfWar: ArtOfWar,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    bladeofJustice: BladeofJustice,
    crusaderStrike: CrusaderStrike,
    judgment: Judgment,
    shieldOfVengeance: ShieldOfVengeance,

    // Talents
    divinePurpose: DivinePurpose,
    crusade: Crusade,
    wakeofAshes: WakeofAshes,
    consecration: Consecration,
    hammerofWrathRetribution: HammerofWrathRetribution,
    righteousVerdict: RighteousVerdict,
    executionSentence: ExecutionSentence,

    // HolyPower
    holyPowerTracker: HolyPowerTracker,
    holyPowerDetails: HolyPowerDetails,
  };
}

export default CombatLogParser;
