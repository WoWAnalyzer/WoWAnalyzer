import CoreAuras from 'parser/core/modules/Auras';
import SPELLS from 'common/SPELLS/classic';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import ITEM_BUFFS from 'game/classic/ITEM_BUFFS';

class Buffs extends CoreAuras {
  // A list of Buffs (on the current player) to highlight on the Timeline
  auras() {
    return [
      {
        spellId: SPELLS.ECLIPSE_LUNAR.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.ECLIPSE_SOLAR.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.INNERVATE.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.NATURES_GRACE_BUFF.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SHOOTING_STARS.id,
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
