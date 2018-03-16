import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import DamageTaken from 'Parser/Core/Modules/DamageTaken';

import Abilities from './Modules/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import BuffedSOTR from './Modules/Features/BuffedSOTR';
import BuffedHOTP from './Modules/Features/BuffedHOTP';
import SpellUsable from './Modules/Features/SpellUsable';
//Items
//import T20_2pc from './Modules/Items/T20_2pc';
//import T20_4pc from './Modules/Items/T20_4pc';
import PillarsOfInmostLight from './Modules/Items/PillarsOfInmostLight';
import TyelcaFerrenMarcussStature from './Modules/Items/TyelcaFerrenMarcussStature';
import RighteousProtector from './Modules/Talents/RighteousProtector';
import Judgment from './Modules/Spells/Judgment';

//import CooldownTracker from './Modules/Features/CooldownTracker';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // Core Statistics
    damageTaken: [DamageTaken, { showStatistic: true }],
    damageDone: [DamageDone, { showStatistic: true }],
    healingDone: [HealingDone, { showStatistic: true }],

    // Paladin Core

    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffedSOTR: BuffedSOTR,
    buffedHOTP: BuffedHOTP,
    spellUsable: SpellUsable,
    //cooldownTracker: CooldownTracker,

    // Talents
    righteousProtector: RighteousProtector,
    judgment: Judgment,

    // Traits

    // Items:
    //t20_2pc: T20_2pc,
    //t20_4pc: T20_4pc,
    pillarsOfInmostLight: PillarsOfInmostLight,
    tyelcaFerrenMarcussStature: TyelcaFerrenMarcussStature,
  };
}

export default CombatLogParser;
