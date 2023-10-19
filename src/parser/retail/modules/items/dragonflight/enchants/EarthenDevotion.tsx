import ITEMS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { Options } from 'parser/core/Analyzer';
import STAT from 'parser/shared/modules/features/STAT';
import StatProcEnchantAnalyzer from './StatProcEnchantAnalyzer';

// ================ SAMPLE LOGS ================
// Earthen Devotion R1
// https://www.warcraftlogs.com/reports/WLc9FDMQkxnhdHCj#fight=3&type=summary&source=19
// Earthen Devotion R2
// https://www.warcraftlogs.com/reports/JGtKWMfcLQ39CD21#fight=2&type=summary&source=28
// Earthen Devotion R3
// https://www.warcraftlogs.com/reports/ACXnrk1TFN6ZLWx9#fight=1&type=summary&source=9

const RANKS = [
  {
    rank: 1,
    enchant: ITEMS.ENCHANT_WEAPON_EARTHEN_DEVOTION_R1,
    amount: 1904.82,
  },
  {
    rank: 2,
    enchant: ITEMS.ENCHANT_WEAPON_EARTHEN_DEVOTION_R2,
    amount: 2084.19,
  },
  {
    rank: 3,
    enchant: ITEMS.ENCHANT_WEAPON_EARTHEN_DEVOTION_R3,
    amount: 2266.08,
  },
];

class EarthenDevotion extends StatProcEnchantAnalyzer {
  constructor(options: Options) {
    super(
      STAT.ARMOR,
      SPELLS.EARTHEN_DEVOTION_ENCHANT,
      SPELLS.EARTHEN_DEVOTION_BUFF,
      RANKS,
      options,
    );
  }
}

export default EarthenDevotion;
