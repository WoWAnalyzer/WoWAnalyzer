import { Options } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import StatProcEnchantAnalyzer from '../../StatProcEnchantAnalyzer';
import STAT from 'parser/shared/modules/features/STAT';

class StormridersFury extends StatProcEnchantAnalyzer {
  constructor(options: Options) {
    super(
      STAT.HASTE,
      SPELLS.STORMRIDERS_FURY_ENCHANT,
      SPELLS.STORMRIDERS_FURY_BUFF,
      [
        { rank: 1, enchant: ITEMS.STORMRIDERS_FURY_R1, amount: 2735 },
        { rank: 2, enchant: ITEMS.STORMRIDERS_FURY_R2, amount: 3325 },
        { rank: 3, enchant: ITEMS.STORMRIDERS_FURY_R3, amount: 3910 },
      ],
      options,
    );

    if (!this.active) {
      return;
    }
  }
}

export default StormridersFury;
