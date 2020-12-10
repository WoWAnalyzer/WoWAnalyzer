import CoreCombatLogParser from 'parser/core/CombatLogParser';
import Judgment from 'parser/paladin/shared/spells/Judgment';

import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/features/Checklist/Module';
import ShieldOfVengeance from './modules/core/ShieldOfVengeance';

import DivinePurpose from '../shared/talents/DivinePurpose';
import HolyAvenger from '../shared/talents/HolyAvenger';
import ArtOfWar from './modules/core/ArtOfWar';
import BladeofJustice from './modules/core/BladeofJustice';
import CrusaderStrike from './modules/core/CrusaderStrike';
import Crusade from './modules/talents/Crusade';
import WakeofAshes from './modules/core/WakeofAshes';
import Consecration from './modules/core/Consecration';
import HammerofWrathRetribution from './modules/core/HammerofWrath';
import RighteousVerdict from './modules/talents/RighteousVerdict';
import ExecutionSentence from './modules/talents/ExecutionSentence';
import EmpyreanPower from './modules/talents/EmpyreanPower';

import HolyPowerTracker from '../shared/holypower/HolyPowerTracker';
import HolyPowerDetails from '../shared/holypower/HolyPowerDetails';
import SanctifiedWrath from './modules/talents/SanctifiedWrath';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
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
    shieldOfVengeance: ShieldOfVengeance,
    judgment: Judgment,

    // Talents
    divinePurpose: DivinePurpose,
    crusade: Crusade,
    wakeofAshes: WakeofAshes,
    consecration: Consecration,
    hammerofWrathRetribution: HammerofWrathRetribution,
    righteousVerdict: RighteousVerdict,
    executionSentence: ExecutionSentence,
    holyAvenger: HolyAvenger,
    empyreanPower: EmpyreanPower,
    sanctifiedWrath: SanctifiedWrath,

    // HolyPower
    holyPowerTracker: HolyPowerTracker,
    holyPowerDetails: HolyPowerDetails,
  };
}

export default CombatLogParser;
