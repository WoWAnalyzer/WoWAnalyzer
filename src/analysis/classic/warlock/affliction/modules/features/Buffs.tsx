import SPELLS from 'common/SPELLS/classic/warlock';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    return [
      {
        spellId: SPELLS.FEL_ARMOR.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.LIFE_TAP_GLYPH.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SHADOW_TRANCE.id,
        timelineHighlight: false,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
