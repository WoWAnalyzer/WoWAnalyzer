import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import HealingDone from 'Parser/Core/Modules/HealingDone';
import DamageDone from 'Parser/Core/Modules/DamageDone';
import DamageTaken from 'Parser/Core/Modules/DamageTaken';

import Abilities from './Modules/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import BuffedSOTR from './Modules/Features/BuffedSOTR';
import BuffedHOTP from './Modules/Features/BuffedHOTP';
import SpellUsable from './Modules/Features/SpellUsable';
import Checklist from './Modules/Features/Checklist';

//Spells
import Judgment from './Modules/Spells/Judgment';
import LightOfTheProtectorTiming from './Modules/Features/LightOfTheProtectorTiming';

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
    buffedSOTR: BuffedSOTR,
    buffedHOTP: BuffedHOTP,
    spellUsable: SpellUsable,
    checklist: Checklist,
    lightOfTheProtectorTiming: LightOfTheProtectorTiming,
    //cooldownTracker: CooldownTracker,

    // Talents
    righteousProtector: RighteousProtector,
    judgment: Judgment,
    seraphim: Seraphim,
  };
}

export default CombatLogParser;
