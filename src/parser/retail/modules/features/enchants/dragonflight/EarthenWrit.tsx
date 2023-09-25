import ITEMS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { Options } from 'parser/core/Analyzer';
import STAT from 'parser/shared/modules/features/STAT';
import StatProccEnchant, { SECONDARY_STAT_WRIT_VALUES } from './StatProcEnchant';

// ================ SAMPLE LOGS ================
// Earthen Writ R1
// https://www.warcraftlogs.com/reports/a2g7G3hHQRjZAr9B#fight=24&type=summary&source=284
// Earthen Writ R2
// https://www.warcraftlogs.com/reports/WqrjPH74VnTwDF8B#fight=11&type=summary&source=390
// Earthen Writ R3
// https://www.warcraftlogs.com/reports/2gBbXWMnP3wkKy87#fight=2&type=summary&source=15

const RANKS = [
  {
    enchant: ITEMS.ENCHANT_WEAPON_EARTHEN_WRIT_R1,
    amount: SECONDARY_STAT_WRIT_VALUES[1],
  },
  {
    enchant: ITEMS.ENCHANT_WEAPON_EARTHEN_WRIT_R2,
    amount: SECONDARY_STAT_WRIT_VALUES[2],
  },
  {
    enchant: ITEMS.ENCHANT_WEAPON_EARTHEN_WRIT_R3,
    amount: SECONDARY_STAT_WRIT_VALUES[3],
  },
];

class EarthenWrit extends StatProccEnchant {
  constructor(options: Options) {
    super(STAT.MASTERY, SPELLS.EARTHEN_WRIT_ENCHANT, SPELLS.EARTHEN_WRIT_BUFF, RANKS, options);
  }
}

export default EarthenWrit;
