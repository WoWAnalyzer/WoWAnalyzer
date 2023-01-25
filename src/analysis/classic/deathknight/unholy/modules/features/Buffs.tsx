import CoreAuras from 'parser/core/modules/Auras';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import ITEM_BUFFS from 'game/classic/ITEM_BUFFS';
import SPELLS from 'common/SPELLS/classic/deathknight';

class Buffs extends CoreAuras {
  auras() {
    return [
      {
        spellId: SPELLS.BONE_SHIELD.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.BLOOD_PRESENCE.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FROST_PRESENCE.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.UNHOLY_PRESENCE.id,
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
