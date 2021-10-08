import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreBuffs from 'parser/core/modules/Buffs';

import * as SPELLS from '@wowanalyzer/tbc-warlock/src/SPELLS';

class Buffs extends CoreBuffs {
  buffs() {
    return [
      {
        spellId: SPELLS.BURNING_WISH,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FEL_ARMOR,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.TOUCH_OF_SHADOW,
        timelineHighlight: true,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
