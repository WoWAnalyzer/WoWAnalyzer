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
import Retribution from './modules/core/Retribution';
import Crusade from './modules/talents/Crusade';
import WakeofAshes from './modules/talents/WakeofAshes';
import Consecration from './modules/talents/Consecration';
import HammerofWrath from './modules/talents/HammerofWrath';
import Inquisition from './modules/talents/Inquisition';
import RighteousVerdict from './modules/talents/RighteousVerdict';

import HolyPowerTracker from './modules/holypower/HolyPowerTracker';
import HolyPowerDetails from './modules/holypower/HolyPowerDetails';

import RelentlessInquisitor from './modules/core/azeritetraits/RelentlessInquisitor';
import RelentlessInquisitorStackHandler from './modules/core/azeritetraits/RelentlessInquisitorStackHandler';
import LightsDecree from './modules/core/azeritetraits/LightsDecree';
import IndomitableJustice from './modules/core/azeritetraits/IndomitableJustice';

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
    retribution: Retribution,
    shieldOfVengeance: ShieldOfVengeance,

    // Talents
    divinePurpose: DivinePurpose,
    crusade: Crusade,
    wakeofAshes: WakeofAshes,
    consecration: Consecration,
    hammerofWrath: HammerofWrath,
    inquisition: Inquisition,
    righteousVerdict: RighteousVerdict,

    // HolyPower
    holyPowerTracker: HolyPowerTracker,
    holyPowerDetails: HolyPowerDetails,

    // Azerite
    relentlessInquisitor: RelentlessInquisitor,
    relentlessInquisitorStackHandler: RelentlessInquisitorStackHandler,
    lightsDecree: LightsDecree,
    indomitableJustice: IndomitableJustice,
  };
}

export default CombatLogParser;
