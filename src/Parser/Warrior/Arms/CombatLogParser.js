import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import BattleCryDamage from './Modules/Core/BattleCryDamage';
import BattleCryGCD from './Modules/Core/BattleCryGCD';
import BattleCrySetup from './Modules/Core/BattleCrySetup';
import ColossusSmash from './Modules/Core/ColossusSmash';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import ColossusSmashUptime from './Modules/BuffDebuff/ColossusSmashUptime';
import Execute from './Modules/Core/Execute';
import Rend from './Modules/Talents/Rend';
import MortalStrike from './Modules/Core/MortalStrike';
import Slam from './Modules/Core/Slam';
import TacticianProc from './Modules/BuffDebuff/TacticianProc';
import ExecuteRange from './Modules/Features/ExecuteRange';
import SpellUsable from './Modules/Features/SpellUsable';
import Channeling from './Modules/Features/Channeling';


//import RelicTraits from './Modules/Traits/RelicTraits';

class CombatLogParser extends CoreCombatLogParser {
  static specModules = {
    // WarriorCore
    damageDone: [DamageDone, {showStatistic: true}],
    abilities: Abilities,

    // Features
    alwaysBeCasting: AlwaysBeCasting,
    battleCryDamage: BattleCryDamage,
    battleCryGcd: BattleCryGCD,
    battleCrySetup: BattleCrySetup,
    colossusSmash: ColossusSmash,
    cooldownThroughputTracker: CooldownThroughputTracker,
    colossusSmashUptime: ColossusSmashUptime,
    execute: Execute,
    executeRange: ExecuteRange,
    rend: Rend,
    mortalStrike: MortalStrike,
    slam: Slam,
    tacticianProc: TacticianProc,
    spellUsable: SpellUsable,
    channeling: Channeling,

    // Talents

    // Traits

    // Items:

  };
}

export default CombatLogParser;
