import CoreCombatLogParser from 'Parser/Core/CombatLogParser';
import DamageDone from 'Parser/Core/Modules/DamageDone';

import Abilities from './Modules/Abilities';
import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import BattleCry from './Modules/Features/BattleCry';
import ColossusSmash from './Modules/Core/ColossusSmash';
import CooldownThroughputTracker from './Modules/Features/CooldownThroughputTracker';
import ColossusSmashUptime from './Modules/BuffDebuff/ColossusSmashUptime';
import Execute from './Modules/Core/Execute';
import Rend from './Modules/Talents/Rend';
import MortalStrike from './Modules/Core/MortalStrike';
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
    battleCry: BattleCry,
    colossusSmash: ColossusSmash,
    cooldownThroughputTracker: CooldownThroughputTracker,
    colossusSmashUptime: ColossusSmashUptime,
    execute: Execute,
    executeRange: ExecuteRange,
    rend: Rend,
    mortalStrike: MortalStrike,
    tacticianProc: TacticianProc,
    spellUsable: SpellUsable,
    channeling: Channeling,

    // Talents

    // Traits

    // Items:

  };
}

export default CombatLogParser;
