import BaseCombatLogParser from 'parser/tbc/CombatLogParser';
import lowRankSpellsSuggestion from 'parser/tbc/suggestions/lowRankSpells';

import lowRankSpells, { whitelist } from './lowRankSpells';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    abilities: Abilities,
    buffs: Buffs,

    lowRankSpells: lowRankSpellsSuggestion(lowRankSpells, whitelist),
  };
}

export default CombatLogParser;
