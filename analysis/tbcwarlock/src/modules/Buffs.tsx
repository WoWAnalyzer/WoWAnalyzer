import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

import * as SPELLS from '@wowanalyzer/tbc-warlock/src/SPELLS';

class Buffs extends CoreAuras {
  auras() {
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
