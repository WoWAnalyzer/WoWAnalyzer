import CoreAuras from 'parser/core/modules/Auras';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import ITEM_BUFFS from 'game/classic/ITEM_BUFFS';
import SPELLS from 'common/SPELLS/classic';

class Buffs extends CoreAuras {
  auras() {
    return [
      {
        spellId: SPELLS.INCANTERS_ABSORPTION_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.LIGHTWEAVE_BUFF.id,
        timelineHighlight: true,
      },
      // Do not adjust the lines below
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
      {
        spellId: Object.keys(ITEM_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
