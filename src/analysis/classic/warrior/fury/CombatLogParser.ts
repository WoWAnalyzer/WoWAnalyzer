// Base file
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
// Features
import { Abilities } from './gen';
import AlwaysBeCasting from './modules/features/AlwaysBeCasting';
import Buffs from './modules/features/Buffs';
import CooldownThroughputTracker from './modules/features/CooldownThroughputTracker';
// Spells
import ColossusSmash from './modules/spells/ColossusSmash';
import ColossusSmashWindowStrategy from './modules/spells/ColossusSmashWindowStrategy';
import Guide from './Guide';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    // Features
    abilities: Abilities,
    alwaysBeCasting: AlwaysBeCasting,
    buffs: Buffs,
    cooldownThroughputTracker: CooldownThroughputTracker,
    // Spells
    colossusSmash: ColossusSmash,
    colossusSmashWindowStrategy: ColossusSmashWindowStrategy,
  };

  static guide = Guide;
}

export default CombatLogParser;
