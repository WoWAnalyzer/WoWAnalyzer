import BaseCombatLogParser from 'parser/tbc/CombatLogParser';
import lowRankSpellsSuggestion from 'parser/tbc/suggestions/lowRankSpells';

import lowRankSpells from './lowRankSpells';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import ColdSnap from './modules/cooldowns/ColdSnap';
import Channeling from './modules/features/Channeling';
import Haste from './modules/Haste';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    abilities: Abilities,
    buffs: Buffs,
    haste: Haste,
    channeling: Channeling,
    coldSnap: ColdSnap,
  };

  static suggestions = [...BaseCombatLogParser.suggestions, lowRankSpellsSuggestion(lowRankSpells)];
  static statistics = [...BaseCombatLogParser.statistics];
}

export default CombatLogParser;
