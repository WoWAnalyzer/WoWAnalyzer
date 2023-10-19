import ITEMS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { Options } from 'parser/core/Analyzer';
import STAT from 'parser/shared/modules/features/STAT';
import StatProcEnchantAnalyzer, { SECONDARY_STAT_WRIT_VALUES } from './StatProcEnchantAnalyzer';

// ================ SAMPLE LOGS ================
// Burning Writ R1
// https://www.warcraftlogs.com/reports/F1NPqhc49XdAnvtx#fight=6&type=summary&source=8
// Burning Writ R2
// https://www.warcraftlogs.com/reports/yPCgxp7ZYazdRtXk#fight=12&type=summary&source=122
// Burning Writ R3
// https://www.warcraftlogs.com/reports/4DZNxRHMbjdnW6QC#fight=21&type=summary&source=569

const RANKS = [
  {
    rank: 1,
    enchant: ITEMS.ENCHANT_WEAPON_BURNING_WRIT_R1,
    amount: SECONDARY_STAT_WRIT_VALUES[1],
  },
  {
    rank: 2,
    enchant: ITEMS.ENCHANT_WEAPON_BURNING_WRIT_R2,
    amount: SECONDARY_STAT_WRIT_VALUES[2],
  },
  {
    rank: 3,
    enchant: ITEMS.ENCHANT_WEAPON_BURNING_WRIT_R3,
    amount: SECONDARY_STAT_WRIT_VALUES[3],
  },
];

class BurningWrit extends StatProcEnchantAnalyzer {
  constructor(options: Options) {
    super(
      STAT.CRITICAL_STRIKE,
      SPELLS.BURNING_WRIT_ENCHANT,
      SPELLS.BURNING_WRIT_BUFF,
      RANKS,
      options,
    );
  }
}

export default BurningWrit;
