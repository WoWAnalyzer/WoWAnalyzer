import * as SPELLS from 'analysis/classic/warlock/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

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
