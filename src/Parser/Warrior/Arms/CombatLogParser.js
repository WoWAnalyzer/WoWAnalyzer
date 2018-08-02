import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import BattleCryDamage from './Modules/Core/BattleCryDamage';
import BattleCryGCD from './Modules/Core/BattleCryGCD';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import ColossusSmashUptime from './Modules/BuffDebuff/ColossusSmashUptime';
import Execute from './Modules/Core/Execute';
import Rend from './Modules/Talents/Rend';
import TacticianProc from './Modules/BuffDebuff/TacticianProc';
import ExecuteRange from './Modules/Features/ExecuteRange';
import SpellUsable from './Modules/Features/SpellUsable';
import Channeling from './Modules/Features/Channeling';
import WarVeteran from './Modules/Items/Tier21_2Set';
// Talents
import AngerManagement from './Modules/Talents/AngerManagement';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // WarriorCore
    damageDone: [DamageDone, { showStatistic: true }],
    abilities: Abilities,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    battleCryDamage: BattleCryDamage,
    battleCryGcd: BattleCryGCD,
    cooldownThroughputTracker: CooldownThroughputTracker,
    colossusSmashUptime: ColossusSmashUptime,
    execute: Execute,
    executeRange: ExecuteRange,
    rend: Rend,
    tacticianProc: TacticianProc,
    spellUsable: SpellUsable,
    channeling: Channeling,
    WarVeteran: WarVeteran,

    // Talents
    angerManagement: AngerManagement,

    // Items:
  };
}

export default CombatLogParser;
