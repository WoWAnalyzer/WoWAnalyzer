import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import DamageTaken from 'Parser/Core/Modules/DamageTaken';

import Abilities from './Modules/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import SpellUsable from './Modules/Features/SpellUsable';
import Checklist from './Modules/Features/Checklist/Module';
import MitigationCheck from './Modules/Features/MitigationCheck';


//Spells
import Judgment from './Modules/Spells/Judgment';
import LightOfTheProtectorTiming from './Modules/Features/LightOfTheProtectorTiming';
import ShieldOfTheRighteous from './Modules/Features/ShieldOfTheRighteous';
import Consecration from './Modules/Features/Consecration';

//Talents
import Seraphim from './Modules/Talents/Seraphim';
import RighteousProtector from './Modules/Talents/RighteousProtector';
import LastDefender from './Modules/Talents/LastDefender';

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
    mitigationcheck: MitigationCheck,
    //cooldownTracker: CooldownTracker,

    // Talents
    righteousProtector: RighteousProtector,
    judgment: Judgment,
    seraphim: Seraphim,
    lastDefender: LastDefender,
  };
}

export default CombatLogParser;
