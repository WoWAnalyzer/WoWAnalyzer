import CoreAuras from 'parser/core/modules/Auras';
import SPELLS from 'common/SPELLS/classic/hunter';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import ITEM_BUFFS from 'game/classic/ITEM_BUFFS';

class Buffs extends CoreAuras {
  // A list of Buffs (on the current player) to highlight on the Timeline
  auras() {
    return [
      {
        spellId: SPELLS.LOCK_AND_LOAD.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.RAPID_FIRE.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.IMPROVED_STEADY_SHOT.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.MISDIRECTION.id,
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
