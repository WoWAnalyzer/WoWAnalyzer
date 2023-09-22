import ITEMS from 'common/ITEMS/dragonflight/enchants';
import SPELLS from 'common/SPELLS/dragonflight/enchants';
import { Options } from 'parser/core/Analyzer';
import StatProccEnchant from './StatProccEnchant';

// ================ SAMPLE LOGS ================
// Sophic Devotion R1
// https://www.warcraftlogs.com/reports/jPyc4bq92XVvJGLm#fight=17&type=summary&source=385
// Sophic Devotion R2
// https://www.warcraftlogs.com/reports/TtPFQ6jcW4Yh9ymz#fight=12&type=summary&source=161
// Sophic Devotion R3
// https://www.warcraftlogs.com/reports/D6pZMtfHTKxBh9g4#fight=35&type=summary&source=145
// Sophic Devotion R2 + R3
// https://www.warcraftlogs.com/reports/cvgJNhdDMjna1prx#fight=5&type=summary&source=176

const RANKS = [
  {
    enchant: ITEMS.ENCHANT_WEAPON_SOPHIC_DEVOTION_R1,
    amount: 783.15,
  },
  {
    enchant: ITEMS.ENCHANT_WEAPON_SOPHIC_DEVOTION_R2,
    amount: 857.25,
  },
  {
    enchant: ITEMS.ENCHANT_WEAPON_SOPHIC_DEVOTION_R3,
    amount: 932.2,
  },
];

class SophicDevotion extends StatProccEnchant {
  constructor(options: Options) {
    super(options.owner.selectedCombatant.primaryStat, SPELLS.SOPHIC_DEVOTION_BUFF, RANKS, options);
  }
}

export default SophicDevotion;
