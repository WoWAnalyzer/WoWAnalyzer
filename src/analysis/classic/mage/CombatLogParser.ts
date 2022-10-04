import Channeling from 'parser/shared/normalizers/Channeling';
import BaseCombatLogParser from 'parser/classic/CombatLogParser';
import lowRankSpellsSuggestion from 'parser/classic/suggestions/lowRankSpells';

import lowRankSpells from './lowRankSpells';
import Abilities from './modules/Abilities';
import Buffs from './modules/Buffs';
import ColdSnap from './modules/cooldowns/ColdSnap';
import Haste from './modules/Haste';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    abilities: Abilities,
    buffs: Buffs,
    haste: Haste,
    channeling: Channeling,
    coldSnap: ColdSnap,

    lowRank: lowRankSpellsSuggestion(lowRankSpells),
  };
}

export default CombatLogParser;
