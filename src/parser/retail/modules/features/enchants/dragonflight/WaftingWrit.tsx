import ENCHANTS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { Options } from 'parser/core/Analyzer';
import STAT from 'parser/shared/modules/features/STAT';
import Writ from './Writ';

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
    enchant: ENCHANTS.ENCHANT_WEAPON_WAFTING_WRIT_R1,
    amount: 1185.67,
  },
  {
    enchant: ENCHANTS.ENCHANT_WEAPON_WAFTING_WRIT_R2,
    amount: 1209.09,
  },
  {
    enchant: ENCHANTS.ENCHANT_WEAPON_WAFTING_WRIT_R3,
    amount: 1394.51,
  },
];

class WaftingWrit extends Writ {
  constructor(options: Options) {
    super(STAT.HASTE, SPELLS.WAFTING_WRIT, RANKS, options);
  }
}

export default WaftingWrit;
