import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Haste from './Modules/PaladinCore/Haste';

import Abilities from './Modules/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import Checklist from './Modules/Features/Checklist/Module';
import Judgment from './Modules/PaladinCore/Judgment';
import ShieldOfVengeance from './Modules/PaladinCore/ShieldOfVengeance';

import DivinePurpose from './Modules/Talents/DivinePurpose';
import ArtOfWar from './Modules/PaladinCore/ArtOfWar';
import Retribution from './Modules/PaladinCore/Retribution';
import Crusade from './Modules/Talents/Crusade';
import Inquisition from './Modules/Talents/Inquisition';
import RighteousVerdict from './Modules/Talents/RighteousVerdict';

import HolyPowerTracker from './Modules/HolyPower/HolyPowerTracker';
import HolyPowerDetails from './Modules/HolyPower/HolyPowerDetails';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    haste: Haste,
    // PaladinCore
    damageDone: [DamageDone, { showStatistic: true }],
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
  };
}

export default CombatLogParser;
