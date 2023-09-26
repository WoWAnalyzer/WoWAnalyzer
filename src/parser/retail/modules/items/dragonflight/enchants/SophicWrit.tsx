import ITEMS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { Options } from 'parser/core/Analyzer';
import StatProccEnchantAnalyzer from './StatProcEnchantAnalyzer';

// ================ SAMPLE LOGS ================
// Sophic Writ R1
// https://www.warcraftlogs.com/reports/GvbxhX2Mcmpk1fgH#fight=2&type=summary&source=17
// Sophic Writ R2
// https://www.warcraftlogs.com/reports/M7NzkmbZV14xKYWD#fight=3&type=summary&source=88
// Sophic Writ R3
// https://www.warcraftlogs.com/reports/Z7P4bRcY2DJMHzgC#fight=25&type=summary&source=608

const RANKS = [
  {
    rank: 1,
    enchant: ITEMS.ENCHANT_WEAPON_SOPHIC_WRIT_R1,
    amount: 634.1,
  },
  {
    rank: 2,
    enchant: ITEMS.ENCHANT_WEAPON_SOPHIC_WRIT_R2,
    amount: 689.68,
  },
  {
    rank: 3,
    enchant: ITEMS.ENCHANT_WEAPON_SOPHIC_WRIT_R3,
    amount: 746.1,
  },
];

class SophicWrit extends StatProccEnchantAnalyzer {
  constructor(options: Options) {
    super(
      options.owner.selectedCombatant.primaryStat,
      SPELLS.SOPHIC_WRIT_ENCHANT,
      SPELLS.SOPHIC_WRIT_BUFF,
      RANKS,
      options,
    );
  }
}

export default SophicWrit;
