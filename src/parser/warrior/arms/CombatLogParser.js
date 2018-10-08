import CoreCombatLogParser from 'parser/core/CombatLogParser';
import DamageDone from 'parser/shared/modules/DamageDone';

import Abilities from './modules/Abilities';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import BattleCryDamage from './modules/core/BattleCryDamage';
import BattleCryGCD from './modules/core/BattleCryGCD';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
import Execute from './modules/core/Execute';
import Rend from './modules/talents/Rend';
import TacticianProc from './modules/buffdebuff/TacticianProc';
import ExecuteRange from './modules/features/ExecuteRange';
import SpellUsable from './modules/features/SpellUsable';
import Channeling from './modules/features/Channeling';

// Talents
import AngerManagement from './modules/talents/AngerManagement';
import DefensiveStance from './modules/talents/DefensiveStance';

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
    execute: Execute,
    executeRange: ExecuteRange,
    rend: Rend,
    tacticianProc: TacticianProc,
    spellUsable: SpellUsable,
    channeling: Channeling,

    // Talents
    angerManagement: AngerManagement,
    defensiveStance: DefensiveStance,

    // Items:
  };
}

export default CombatLogParser;
