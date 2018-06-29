import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import DamageTaken from 'Parser/Core/Modules/DamageTaken';

import Abilities from './Modules/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import SpellUsable from './Modules/Features/SpellUsable';
import Checklist from './Modules/Features/Checklist';

//Spells
import Judgment from './Modules/Spells/Judgment';
import LightOfTheProtectorTiming from './Modules/Features/LightOfTheProtectorTiming';
import ShieldOfTheRighteous from './Modules/Features/ShieldOfTheRighteous';
import Consecration from './Modules/Features/Consecration';

//Items
//import T20_2pc from './Modules/Items/T20_2pc';
//import T20_4pc from './Modules/Items/T20_4pc';
import PillarsOfInmostLight from './Modules/Items/PillarsOfInmostLight';
import TyelcaFerrenMarcussStature from './Modules/Items/TyelcaFerrenMarcussStature';
import BreastplateOfTheGoldenValkyr from './Modules/Items/BreastplateOfTheGoldenValkyr';
import HeadcliffsImmortality from './Modules/Items/HeadcliffsImmortality';

//Talents
import Seraphim from './Modules/Talents/Seraphim';
import RighteousProtector from './Modules/Talents/RighteousProtector';

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
    spellUsable: SpellUsable,
    checklist: Checklist,
    lightOfTheProtectorTiming: LightOfTheProtectorTiming,
    shieldOfTheRighteous: ShieldOfTheRighteous,
    consecration: Consecration,
    //cooldownTracker: CooldownTracker,

    // Talents
    righteousProtector: RighteousProtector,
    judgment: Judgment,
    seraphim: Seraphim,

    // Items:
    //t20_2pc: T20_2pc,
    //t20_4pc: T20_4pc,
    pillarsOfInmostLight: PillarsOfInmostLight,
    tyelcaFerrenMarcussStature: TyelcaFerrenMarcussStature,
    breastplateOfTheGoldenValkyr: BreastplateOfTheGoldenValkyr,
    headcliffsImmortality: HeadcliffsImmortality,
  };
}

export default CombatLogParser;
