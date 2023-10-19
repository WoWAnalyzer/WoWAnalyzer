import ENCHANTS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { Options } from 'parser/core/Analyzer';
import STAT from 'parser/shared/modules/features/STAT';
import StatProcEnchantAnalyzer, { SECONDARY_STAT_WRIT_VALUES } from './StatProcEnchantAnalyzer';

// ================ SAMPLE LOGS ================
// Wafting Writ R1
// https://www.warcraftlogs.com/reports/hwGB9JHC7PLRfZMK#fight=12&type=summary&source=23
// Wafting Writ R2
// https://www.warcraftlogs.com/reports/Wx8mLFCKT67dwGP3#fight=3&type=summary&source=47
// Wafting Writ R3
// https://www.warcraftlogs.com/reports/rxR13mGzY4WkH2QN#fight=7&type=summary&source=139

// Define an array of enchant effects
const RANKS = [
  {
    rank: 1,
    enchant: ENCHANTS.ENCHANT_WEAPON_WAFTING_WRIT_R1,
    amount: SECONDARY_STAT_WRIT_VALUES[1],
  },
  {
    rank: 2,
    enchant: ENCHANTS.ENCHANT_WEAPON_WAFTING_WRIT_R2,
    amount: SECONDARY_STAT_WRIT_VALUES[2],
  },
  {
    rank: 3,
    enchant: ENCHANTS.ENCHANT_WEAPON_WAFTING_WRIT_R3,
    amount: SECONDARY_STAT_WRIT_VALUES[3],
  },
];

class WaftingWrit extends StatProcEnchantAnalyzer {
  constructor(options: Options) {
    super(STAT.HASTE, SPELLS.WAFTING_WRIT_ENCHANT, SPELLS.WAFTING_WRIT_BUFF, RANKS, options);
  }
}

export default WaftingWrit;
