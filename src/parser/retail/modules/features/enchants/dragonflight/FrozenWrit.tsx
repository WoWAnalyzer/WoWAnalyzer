import ITEMS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { Options } from 'parser/core/Analyzer';
import STAT from 'parser/shared/modules/features/STAT';
import StatProccEnchant, { SECONDARY_STAT_WRIT_VALUES } from './StatProcEnchant';

// ================ SAMPLE LOGS ================
// Frozen Writ R1
// https://www.warcraftlogs.com/reports/z9QTCHWBx4RdPtLD#fight=22&type=summary&source=385
// Frozen Writ R2
// https://www.warcraftlogs.com/reports/xYydvkJgDFWmTKHB#fight=53&type=summary&source=14
// Frozen Writ R3
// https://www.warcraftlogs.com/reports/my7vkGLDpdh8AKXz#fight=28&type=summary&source=273

const RANKS = [
  {
    enchant: ITEMS.ENCHANT_WEAPON_FROZEN_WRIT_R1,
    amount: SECONDARY_STAT_WRIT_VALUES[1],
  },
  {
    enchant: ITEMS.ENCHANT_WEAPON_FROZEN_WRIT_R2,
    amount: SECONDARY_STAT_WRIT_VALUES[2],
  },
  {
    enchant: ITEMS.ENCHANT_WEAPON_FROZEN_WRIT_R3,
    amount: SECONDARY_STAT_WRIT_VALUES[3],
  },
];

class FrozenWrit extends StatProccEnchant {
  constructor(options: Options) {
    super(STAT.VERSATILITY, SPELLS.FROZEN_WRIT_ENCHANT, SPELLS.FROZEN_WRIT_BUFF, RANKS, options);
  }
}

export default FrozenWrit;
