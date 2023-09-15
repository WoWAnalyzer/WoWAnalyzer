import ITEMS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { Options } from 'parser/core/Analyzer';
import STAT from 'parser/shared/modules/features/STAT';
import Writ from './Writ';

// ================ SAMPLE LOGS ================
// Burning Writ R1
// https://www.warcraftlogs.com/reports/F1NPqhc49XdAnvtx#fight=6&type=summary&source=8
// Burning Writ R2
// https://www.warcraftlogs.com/reports/yPCgxp7ZYazdRtXk#fight=12&type=summary&source=122
// Burning Writ R3
// https://www.warcraftlogs.com/reports/4DZNxRHMbjdnW6QC#fight=21&type=summary&source=569

const RANKS = [
  {
    enchant: ITEMS.ENCHANT_WEAPON_BURNING_WRIT_R1,
    amount: 1185.67,
  },
  {
    enchant: ITEMS.ENCHANT_WEAPON_BURNING_WRIT_R2,
    amount: 1209.09,
  },
  {
    enchant: ITEMS.ENCHANT_WEAPON_BURNING_WRIT_R3,
    amount: 1394.51,
  },
];

class BurningWrit extends Writ {
  constructor(options: Options) {
    super(STAT.CRITICAL_STRIKE, SPELLS.BURNING_WRIT_BUFF, RANKS, options);
  }
}

export default BurningWrit;
