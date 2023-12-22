import CoreAuras from 'parser/core/modules/Auras';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import ITEM_BUFFS from 'game/classic/ITEM_BUFFS';
import SPELLS from 'common/SPELLS/classic/warlock';

class Buffs extends CoreAuras {
  auras() {
    return [
      {
        spellId: SPELLS.LIFE_TAP_GLYPH.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ERADICATION_BUFF_6.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ERADICATION_BUFF_12.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ERADICATION_BUFF_20.id,
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
