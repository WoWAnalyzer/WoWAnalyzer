import CoreAuras from 'parser/core/modules/Auras';
import SPELLS from 'common/SPELLS/classic';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import ITEM_BUFFS from 'game/classic/ITEM_BUFFS';

class Buffs extends CoreAuras {
  // A list of Buffs (on the current player) to highlight on the Timeline
  auras() {
    return [
      // not highlighting berserker/battle stance because they are just used for diff ability access.
      // dstance is actually relevant because it also reduces damage done so you don't want to sit in it
      {
        spellId: SPELLS.BERSERKER_STANCE.id,
      },
      {
        spellId: SPELLS.BATTLE_STANCE.id,
      },
      {
        spellId: SPELLS.DEFENSIVE_STANCE.id,
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
