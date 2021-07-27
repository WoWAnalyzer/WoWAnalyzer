import BaseCombatLogParser from 'parser/tbc/CombatLogParser';
import lowRankSpellsSuggestion from 'parser/tbc/suggestions/lowRankSpells';

import lowRankSpells from './lowRankSpells';
import lowRankSpellsPet from './lowRankSpellsPet';
import Abilities from './modules/Abilities';
import AutoShotCooldown from './modules/AutoShotCooldown';
import Buffs from './modules/Buffs';
import Haste from './modules/Haste';
import KillCommandNormalizer from './normalizers/KillCommandNormalizer';
import GoForTheThroat from './statistics/GoForTheThroat';
import growl from './suggestions/growl';
import lowRankSpellsPetSuggestion from './suggestions/lowRankSpellsPet';

class CombatLogParser extends BaseCombatLogParser {
  static specModules = {
    abilities: Abilities,
    buffs: Buffs,
    autoShotCooldown: AutoShotCooldown,
    haste: Haste,
    killCommandNormalizer: KillCommandNormalizer,
  };

  static suggestions = [
    ...BaseCombatLogParser.suggestions,
    lowRankSpellsSuggestion(lowRankSpells),
    lowRankSpellsPetSuggestion(lowRankSpellsPet),
    growl(),
  ];
  static statistics = [...BaseCombatLogParser.statistics, GoForTheThroat];
}

export default CombatLogParser;
