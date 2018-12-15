import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';
import GlobalCooldown from './modules/core/GlobalCooldown';
import Haste from './modules/core/Haste';

import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Checklist from './modules/features/Checklist/Module';
import Judgment from './modules/core/Judgment';
import ShieldOfVengeance from './modules/core/ShieldOfVengeance';

import DivinePurpose from './modules/talents/DivinePurpose';
import ArtOfWar from './modules/core/ArtOfWar';
import Retribution from './modules/core/Retribution';
import Crusade from './modules/talents/Crusade';
import Inquisition from './modules/talents/Inquisition';
import RighteousVerdict from './modules/talents/RighteousVerdict';

import HolyPowerTracker from './modules/holypower/HolyPowerTracker';
import HolyPowerDetails from './modules/holypower/HolyPowerDetails';

import RelentlessInquisitor from './modules/core/azeritetraits/RelentlessInquisitor';
import RelentlessInquisitorStackHandler from './modules/core/azeritetraits/RelentlessInquisitorStackHandler';
import LightsDecree from './modules/core/azeritetraits/LightsDecree';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    haste: Haste,
    // PaladinCore
    damageDone: [DamageDone, { showStatistic: true }],
    globalCooldown: GlobalCooldown,
    artOfWar: ArtOfWar,

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    cooldownThroughputTracker: CooldownThroughputTracker,
    checklist: Checklist,
    judgment: Judgment,
    retribution: Retribution,
    shieldOfVengeance: ShieldOfVengeance,
    
    // Talents
    divinePurpose: DivinePurpose,
    crusade: Crusade,
    inquisition: Inquisition,
    righteousVerdict: RighteousVerdict,

    // HolyPower
    holyPowerTracker: HolyPowerTracker,
    holyPowerDetails: HolyPowerDetails,

    // Azerite
    relentlessInquisitor: RelentlessInquisitor,
    relentlessInquisitorStackHandler: RelentlessInquisitorStackHandler,
    lightsDecree: LightsDecree,
  };
}

export default CombatLogParser;
