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
        spellId: SPELLS.METAMORPHOSIS.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.MOLTEN_CORE_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DECIMATION.id,
        timelineHighlight: true,
      },
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
